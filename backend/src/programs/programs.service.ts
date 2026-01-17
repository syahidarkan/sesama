import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProgramStatus, UserRole, ProgramType } from '@prisma/client';

@Injectable()
export class ProgramsService {
    constructor(private prisma: PrismaService) { }

    async create(data: any, userId: string, userRole: UserRole) {
        // Validate based on program type
        if (data.programType === ProgramType.INDIVIDU) {
            this.validateIndividuProgram(data);
        } else if (data.programType === ProgramType.LEMBAGA) {
            this.validateLembagaProgram(data);
        }

        // Generate slug from title
        const slug = this.generateSlug(data.title);

        // MANAGER and SUPER_ADMIN bypass approval (auto-ACTIVE)
        const canAutoPublish = userRole === UserRole.MANAGER || userRole === UserRole.SUPER_ADMIN;
        const status = canAutoPublish ? ProgramStatus.ACTIVE : ProgramStatus.DRAFT;

        const publishedAt = status === ProgramStatus.ACTIVE ? new Date() : null;

        return this.prisma.program.create({
            data: {
                ...data,
                slug,
                createdBy: userId,
                status,
                publishedAt,
            },
        });
    }

    async findAll(status?: string, limit?: number, offset?: number) {
        const where = status ? { status: status as ProgramStatus } : {};

        const [data, total] = await Promise.all([
            this.prisma.program.findMany({
                where,
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                    _count: {
                        select: {
                            donations: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            this.prisma.program.count({ where }),
        ]);

        return {
            data,
            total,
            limit: limit || total,
            offset: offset || 0,
        };
    }

    async findBySlug(slug: string) {
        const program = await this.prisma.program.findUnique({
            where: { slug },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
                donations: {
                    where: { status: 'SUCCESS' },
                    select: {
                        id: true,
                        donorName: true,
                        amount: true,
                        isAnonymous: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!program) {
            throw new NotFoundException('Program not found');
        }

        return program;
    }

    async findOne(id: string) {
        const program = await this.prisma.program.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
                donations: {
                    where: { status: 'SUCCESS' },
                    select: {
                        id: true,
                        donorName: true,
                        amount: true,
                        isAnonymous: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!program) {
            throw new NotFoundException('Program not found');
        }

        return program;
    }

    async update(id: string, data: any) {
        // If title changed, regenerate slug
        if (data.title) {
            data.slug = this.generateSlug(data.title);
        }

        return this.prisma.program.update({
            where: { id },
            data,
        });
    }

    async submit(id: string) {
        const program = await this.findOne(id);

        if (program.status !== ProgramStatus.DRAFT) {
            throw new BadRequestException('Only DRAFT programs can be submitted');
        }

        return this.prisma.program.update({
            where: { id },
            data: {
                status: ProgramStatus.PENDING_APPROVAL,
            },
        });
    }

    async approve(id: string, comment?: string) {
        const program = await this.findOne(id);

        if (program.status !== ProgramStatus.PENDING_APPROVAL) {
            throw new BadRequestException('Only PENDING_APPROVAL programs can be approved');
        }

        return this.prisma.program.update({
            where: { id },
            data: {
                status: ProgramStatus.ACTIVE,
                publishedAt: new Date(),
            },
        });
    }

    async reject(id: string, comment?: string) {
        const program = await this.findOne(id);

        if (program.status !== ProgramStatus.PENDING_APPROVAL) {
            throw new BadRequestException('Only PENDING_APPROVAL programs can be rejected');
        }

        return this.prisma.program.update({
            where: { id },
            data: {
                status: ProgramStatus.REJECTED,
            },
        });
    }

    async delete(id: string) {
        // Soft delete by setting status to CLOSED
        return this.prisma.program.update({
            where: { id },
            data: {
                status: ProgramStatus.CLOSED,
                closedAt: new Date(),
            },
        });
    }

    async updateCollectedAmount(id: string, amount: number) {
        return this.prisma.program.update({
            where: { id },
            data: {
                collectedAmount: {
                    increment: amount,
                },
            },
        });
    }

    async close(id: string) {
        return this.prisma.program.update({
            where: { id },
            data: {
                status: ProgramStatus.CLOSED,
                closedAt: new Date(),
            },
        });
    }

    /**
     * Validate INDIVIDU program requirements
     */
    private validateIndividuProgram(data: any) {
        const errors: string[] = [];

        // Data Pengaju validation
        if (!data.applicantName) {
            errors.push('Nama lengkap pengaju wajib diisi untuk program individu');
        }

        if (!data.applicantPhone) {
            errors.push('No. HP/WhatsApp pengaju wajib diisi untuk program individu');
        }

        if (!data.ktpPengajuUrl) {
            errors.push('Foto KTP pengaju wajib diisi untuk program individu');
        }

        // Bukti Kondisi validation
        if (!data.buktiKondisiUrls || (Array.isArray(data.buktiKondisiUrls) && data.buktiKondisiUrls.length === 0)) {
            errors.push('Foto/Video bukti kondisi wajib diisi untuk program individu');
        }

        // Surat Keterangan validation
        if (!data.suratKeteranganRtUrl) {
            errors.push('Surat keterangan RT/RW/Kelurahan wajib diisi untuk program individu');
        }

        // Rekening Penerima validation
        if (!data.beneficiaryBankName) {
            errors.push('Nama bank penerima manfaat wajib diisi untuk program individu');
        }

        if (!data.beneficiaryBankAccount) {
            errors.push('No. rekening penerima manfaat wajib diisi untuk program individu');
        }

        if (!data.beneficiaryAccountName) {
            errors.push('Nama pemilik rekening wajib diisi untuk program individu');
        }

        if (errors.length > 0) {
            throw new BadRequestException(errors.join(', '));
        }
    }

    /**
     * Validate LEMBAGA program requirements
     */
    private validateLembagaProgram(data: any) {
        const errors: string[] = [];

        if (!data.institutionName) {
            errors.push('Nama Lembaga wajib diisi untuk program lembaga');
        }

        if (!data.institutionType) {
            errors.push('Jenis Lembaga wajib diisi untuk program lembaga');
        }

        if (!data.institutionAddress) {
            errors.push('Alamat Lembaga wajib diisi untuk program lembaga');
        }

        if (!data.aktaNotaris) {
            errors.push('Akta Notaris wajib diisi untuk program lembaga');
        }

        if (!data.npwp) {
            errors.push('NPWP wajib diisi untuk program lembaga');
        }

        if (!data.proposalUrl) {
            errors.push('Proposal & RAB wajib diisi untuk program lembaga');
        }

        if (!data.picName) {
            errors.push('Nama PIC wajib diisi untuk program lembaga');
        }

        if (!data.picPhone) {
            errors.push('No. HP PIC wajib diisi untuk program lembaga');
        }

        if (!data.bankName) {
            errors.push('Nama Bank wajib diisi untuk program lembaga');
        }

        if (!data.bankAccountNumber) {
            errors.push('No. Rekening wajib diisi untuk program lembaga');
        }

        if (!data.bankAccountName) {
            errors.push('Nama Pemilik Rekening wajib diisi untuk program lembaga');
        }

        if (errors.length > 0) {
            throw new BadRequestException(errors.join(', '));
        }
    }

    private generateSlug(title: string): string {
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const timestamp = Date.now().toString().slice(-6);
        return `${slug}-${timestamp}`;
    }
}
