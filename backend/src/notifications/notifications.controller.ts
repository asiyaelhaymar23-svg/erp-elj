import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  @Get() findMine(@Req() req: any) { return this.service.findForUser(req.user.userId); }

  @Get('unread-count') unreadCount(@Req() req: any) { return this.service.countUnread(req.user.userId); }

  @Patch(':id/read') markAsRead(@Param('id') id: string) { return this.service.markAsRead(+id); }

  @Patch('read-all') markAllAsRead(@Req() req: any) { return this.service.markAllAsRead(req.user.userId); }
}
