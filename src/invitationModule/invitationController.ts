import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InvitationService } from './invitationService';
import { ApiTags } from '@nestjs/swagger';
import {
  GetInvitationsUserIdDTO,
  MarkInvitationAsRead,
} from './invitation.dto';

@Controller('invitations')
@ApiTags('Invitations')
export class InvitationController {
  constructor(private readonly invitationservice: InvitationService) {}
  @Post('mark_invitation_as_read')
  markAsRead(@Body() body: MarkInvitationAsRead) {
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
  getinvitations(@Param() param: GetInvitationsUserIdDTO) {
    const { userId } = param;
    return this.invitationservice.getinvitations(userId);
  }
}
