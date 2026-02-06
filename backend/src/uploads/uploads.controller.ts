import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Req,
  Res,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, FileCategory } from '@prisma/client';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  /**
   * Upload single file
   */
  @Post('single')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
    @Body('category') category?: FileCategory,
    @Body('entityType') entityType?: string,
    @Body('entityId') entityId?: string,
    @Body('fieldName') fieldName?: string,
    @Body('isPublic') isPublic?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }

    return this.uploadsService.saveFile(file, req.user.id, req.user.role, {
      category: category as FileCategory,
      entityType,
      entityId,
      fieldName,
      isPublic: isPublic === 'true',
    });
  }

  /**
   * Upload multiple files (max 10)
   */
  @Post('multiple')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req,
    @Body('category') category?: FileCategory,
    @Body('entityType') entityType?: string,
    @Body('entityId') entityId?: string,
    @Body('fieldName') fieldName?: string,
    @Body('isPublic') isPublic?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('File tidak ditemukan');
    }

    return this.uploadsService.saveMultipleFiles(files, req.user.id, req.user.role, {
      category: category as FileCategory,
      entityType,
      entityId,
      fieldName,
      isPublic: isPublic === 'true',
    });
  }

  /**
   * Get file by ID (metadata)
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getFileById(@Param('id') id: string) {
    return this.uploadsService.getFileById(id);
  }

  /**
   * Serve file by stored filename (public for public files, auth required for private)
   */
  @Get('file/:storedFilename')
  async serveFile(
    @Param('storedFilename') storedFilename: string,
    @Res() res: Response,
  ) {
    const { path, mimeType, filename } = await this.uploadsService.getFilePath(storedFilename);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.sendFile(path);
  }

  /**
   * Download file
   */
  @Get('download/:storedFilename')
  async downloadFile(
    @Param('storedFilename') storedFilename: string,
    @Res() res: Response,
  ) {
    const { path, mimeType, filename } = await this.uploadsService.getFilePath(storedFilename);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(path);
  }

  /**
   * Get all files (admin only)
   */
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPERVISOR, UserRole.SUPER_ADMIN)
  async getAllFiles(
    @Query('category') category?: FileCategory,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('uploadedBy') uploadedBy?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.uploadsService.getAllFiles({
      category,
      entityType,
      entityId,
      uploadedBy,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  /**
   * Get files by entity
   */
  @Get('entity/:entityType/:entityId')
  @UseGuards(JwtAuthGuard)
  async getFilesByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.uploadsService.getFilesByEntity(entityType, entityId);
  }

  /**
   * Get storage statistics (admin only)
   */
  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPERVISOR, UserRole.SUPER_ADMIN)
  async getStorageStats() {
    return this.uploadsService.getStorageStats();
  }

  /**
   * Associate file with entity
   */
  @Post(':id/associate')
  @UseGuards(JwtAuthGuard)
  async associateFile(
    @Param('id') id: string,
    @Body('entityType') entityType: string,
    @Body('entityId') entityId: string,
    @Body('fieldName') fieldName?: string,
  ) {
    return this.uploadsService.associateFileWithEntity(id, entityType, entityId, fieldName);
  }

  /**
   * Delete file
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteFile(@Param('id') id: string, @Req() req) {
    return this.uploadsService.deleteFile(id, req.user.id, req.user.role);
  }
}
