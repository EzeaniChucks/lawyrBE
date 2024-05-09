import { ApiProperty } from '@nestjs/swagger';

export class MarkMessageAsRead {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  messageId: string;

  @ApiProperty({ example: 'mongooseGeneratedId' })
  userId: string;
}

export class GetNotifId {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  userId: string;
}
