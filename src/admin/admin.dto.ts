import { ApiProperty } from '@nestjs/swagger';

export class TurnUserToSubAdminDTO {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  userId: string;
}

export class TurnSubAdminToUserDTO {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  userId: string;
}

export class AddSubAdminAccessDTO {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  subAdminId: string;

  @ApiProperty({
    example: 'can_penalize_users',
    enum: [
      'can_penalize_users',
      'can_ban_users',
      'can_create_other_subadmins',
      'can_remove_other_subadmins',
      'can_create_admin_content',
      'can_edit_admin_content',
      'can_delete_admin_content',
    ],
  })
  accessName: string;
}

export class RemoveSubAdminAccessDTO {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  subAdminId: string;

  @ApiProperty({
    example: 'can_penalize_users',
    enum: [
      'can_penalize_users',
      'can_ban_users',
      'can_create_other_subadmins',
      'can_remove_other_subadmins',
      'can_create_admin_content',
      'can_edit_admin_content',
      'can_delete_admin_content',
    ],
  })
  accessName: string;
}
