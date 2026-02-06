import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { containsBadWords } from './bad-words';

const ADMIN_ROLES: UserRole[] = [
  UserRole.CONTENT_MANAGER,
  UserRole.MANAGER,
  UserRole.SUPER_ADMIN,
];

const MIN_LENGTH = 3;
const MAX_LENGTH = 500;
const SPAM_COOLDOWN_SECONDS = 300; // 5 menit

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(programId: string, userId?: string, userRole?: UserRole) {
    const isAdmin = userRole && ADMIN_ROLES.includes(userRole);

    const comments = await this.prisma.comment.findMany({
      where: {
        programId,
        ...(isAdmin ? {} : { isHidden: false }),
      },
      include: {
        user: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return comments;
  }

  async create(programId: string, userId: string, content: string) {
    // Validate content length
    if (content.length < MIN_LENGTH) {
      throw new BadRequestException(`Komentar minimal ${MIN_LENGTH} karakter`);
    }
    if (content.length > MAX_LENGTH) {
      throw new BadRequestException(`Komentar maksimal ${MAX_LENGTH} karakter`);
    }

    // Check bad words
    const badWordCheck = containsBadWords(content);
    if (badWordCheck.hasBadWords) {
      throw new BadRequestException(
        'Komentar mengandung kata-kata yang tidak pantas',
      );
    }

    // Check program exists and is ACTIVE
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
    });
    if (!program) {
      throw new NotFoundException('Program tidak ditemukan');
    }
    if (program.status !== 'ACTIVE' && program.status !== 'CLOSED') {
      throw new BadRequestException(
        'Komentar hanya bisa ditambahkan pada program yang aktif',
      );
    }

    // Anti-spam: check last comment time
    const lastComment = await this.prisma.comment.findFirst({
      where: { userId, programId },
      orderBy: { createdAt: 'desc' },
    });

    if (lastComment) {
      const diffSeconds =
        (Date.now() - lastComment.createdAt.getTime()) / 1000;
      if (diffSeconds < SPAM_COOLDOWN_SECONDS) {
        const remaining = Math.ceil(SPAM_COOLDOWN_SECONDS - diffSeconds);
        throw new BadRequestException(
          `Harap tunggu ${remaining} detik sebelum komentar lagi`,
        );
      }
    }

    return this.prisma.comment.create({
      data: { programId, userId, content },
      include: {
        user: {
          select: { id: true, name: true, role: true },
        },
      },
    });
  }

  async hide(id: string, userRole: UserRole) {
    if (!ADMIN_ROLES.includes(userRole)) {
      throw new ForbiddenException('Anda tidak memiliki akses');
    }

    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Komentar tidak ditemukan');

    return this.prisma.comment.update({
      where: { id },
      data: { isHidden: true },
    });
  }

  async unhide(id: string, userRole: UserRole) {
    if (!ADMIN_ROLES.includes(userRole)) {
      throw new ForbiddenException('Anda tidak memiliki akses');
    }

    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Komentar tidak ditemukan');

    return this.prisma.comment.update({
      where: { id },
      data: { isHidden: false },
    });
  }

  async delete(id: string, userRole: UserRole) {
    if (!ADMIN_ROLES.includes(userRole)) {
      throw new ForbiddenException('Anda tidak memiliki akses');
    }

    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Komentar tidak ditemukan');

    return this.prisma.comment.delete({ where: { id } });
  }
}
