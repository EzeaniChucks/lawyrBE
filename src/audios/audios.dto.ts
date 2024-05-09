import { ApiProperty } from '@nestjs/swagger';

export class UploadAudiosDTO {
  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'MongooseGeneratedId' })
  parentId: string;

  @ApiProperty({ example: 'MongooseGeneratedId', enum: ['create', 'update'] })
  audioActionType: string;

  @ApiProperty({ example: 'Name of Audio Group' })
  title: string;

  @ApiProperty({
    example: 'Description to tell user what audio group is about',
  })
  description: string;
}

export class ReplaceSingleAudiosDTO {
  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'MongooseGeneratedId' })
  parentId: string;

  @ApiProperty({ example: 'MongooseGeneratedId' })
  oldAudioId: string;
}

export class EditSingleAudioNameDTO {
  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'MongooseGeneratedId' })
  parentId: string;

  @ApiProperty({ example: 'MongooseGeneratedId' })
  singleAudioId: string;
}

export class EditAudioDetailsDTO {
  @ApiProperty({ example: 'MongooseGeneratedId' })
  parentId: string;

  @ApiProperty({ example: 'New description for audio group' })
  description: string;

  @ApiProperty({ example: 'Audio Group title' })
  title: string;
}

export class DeleteSingleAudioDTO {
  @ApiProperty({ example: 'MongooseGeneratedId' })
  parentId: string;

  @ApiProperty({ example: 'MongooseGeneratedId' })
  audioId: string;
}
export class DeleteEntireAudioGroupDTO {
  @ApiProperty({ example: 'MongooseGeneratedId' })
  parentaudioId: string;
}

export type AudioDetailsDTO = {
  title: string;
  description: string;
};

export type AudioFullDetails = {
  details: AudioDetailsDTO;
  _id: string;
  createdAt: string | Date | number;
  updatedAt: string | Date | number;
};

export type Audios = {
  _id: string;
  name: string;
  src: string;
  type: string;
};

export type AudiossObject = {
  _id: string;
  details: {
    title: string;
    description: string;
  };
  videos: Audios[];
  createdAt?: Date | string | number;
  updatedAt?: Date | string | number;
};

export type FringeData = {
  searchTags: string[];
  parentIds: string[];
  isSubscription: boolean;
  isPurchase: boolean;
  productPrice: number;
  productPriceCurrency: 'NGN' | string;
  subscriptionPrice: number;
  subscriptionPriceCurrency: 'NGN' | string;
  subscriptionDurationNo: 0;
  subscriptionDurationUnit: 'days' | 'weeks' | 'months' | 'years';
  subscribedUsersIds: string[];
  paidUsersIds: string[];
};
