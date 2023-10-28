import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NotifService } from './notifService';
import { ApiTags } from '@nestjs/swagger';

@Controller('notifications')
@ApiTags('Notifications')
export class NotifController {
  constructor(private readonly notificationservice: NotifService) {}
  @Post('mark_message_as_read')
  markAsRead(@Body() body: any) {
    const { messageId, userId } = body;
    return this.notificationservice.markAsChecked(messageId, userId);
  }

  // @Post('log_notification')
  // logNotifications(@Body() body: any) {
  //   const { message, userId, link, eventId, type, frontEndObjectId } = body;
  //   return this.notificationservice.logNotifications(
  //     message,link,type,frontEndObjectId
  //   );
  // }

  @Get('get_notifications/:userId')
  getNotifications(@Param('userId') userId: string) {
    return this.notificationservice.getNotifications(userId);
  }
}