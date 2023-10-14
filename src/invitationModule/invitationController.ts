import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InvitationService } from './invitationService';

@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationservice: InvitationService) {}
  @Post('mark_invitation_as_read')
  markAsRead(@Body() body: any) {
    const { messageId, userId } = body;
    return this.invitationservice.markAsChecked(messageId, userId);
  }

  // @Post('log_invitation')
  // loginvitations(@Body() body: any) {
  //   const { message, userId, link, eventId, type, frontEndObjectId } = body;
  //   return this.invitationservice.loginvitations(
  //     message,link,type,frontEndObjectId
  //   );
  // }

  @Get('get_invitations/:userId')
  getinvitations(@Param('userId') userId: string) {
    return this.invitationservice.getinvitations(userId);
  }
}
