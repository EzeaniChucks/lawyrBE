import { ApiProperty } from '@nestjs/swagger';

export class MarkInvitationAsRead {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  messageId: string;
  @ApiProperty({ example: 'mongooseGeneratedId' })
  userId: string;
}

export class GetInvitationsUserIdDTO {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  userId: string;
}
