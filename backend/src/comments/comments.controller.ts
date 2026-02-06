import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  async findAll(
    @Query('programId') programId: string,
    @Req() req: any,
  ) {
    // Try to get user from token if available (optional auth)
    const userId = req.user?.id;
    const userRole = req.user?.role;
    return this.commentsService.findAll(programId, userId, userRole);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() body: { programId: string; content: string },
    @Req() req: any,
  ) {
    return this.commentsService.create(body.programId, req.user.id, body.content);
  }

  @Patch(':id/hide')
  @UseGuards(JwtAuthGuard)
  async hide(@Param('id') id: string, @Req() req: any) {
    return this.commentsService.hide(id, req.user.role);
  }

  @Patch(':id/unhide')
  @UseGuards(JwtAuthGuard)
  async unhide(@Param('id') id: string, @Req() req: any) {
    return this.commentsService.unhide(id, req.user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.commentsService.delete(id, req.user.role);
  }
}
