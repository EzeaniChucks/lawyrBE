import { ApiProperty } from '@nestjs/swagger';

export type VideoDetailsDTO = {
  title: string;
  description: string;
};

export type VideoFullDetails = {
  details: VideoDetailsDTO;
  _id: string;
  createdAt: string | Date | number;
  updatedAt: string | Date | number;
};

export type Videos = {
  _id: string;
  name: string;
  src: string;
  type: string;
};
export type VideosObject = {
  _id: string;
  details: {
    title: string;
    description: string;
  };
  videos: Videos[];
  createdAt?: Date | string | number;
  updatedAt?: Date | string | number;
};

export class UpLoadVideoDTO {
  @ApiProperty({ example: `Video Collection's Title` })
  title: string;

  @ApiProperty({ example: `Video Collection's description` })
  description: string;

  @ApiProperty({ example: `Individual video name within collection` })
  name: string;

  @ApiProperty({ example: `mongooseGeneratedId` })
  parentId: string;

  @ApiProperty({ example: `create | update` })
  videoActionType: string;
}

export class ReplaceSingleVideoDTO {
  @ApiProperty({ example: `Individual video name within collection` })
  name: string;
  @ApiProperty({ example: `mongooseGeneratedId` })
  parentId: string;
  @ApiProperty({ example: `mongooseGeneratedId` })
  oldVideoId: string;
}

export class EditSingleVideoNameDTO {
  @ApiProperty({ example: `Individual video name within collection` })
  name: string;
  @ApiProperty({ example: `mongooseGeneratedId` })
  parentId: string;
  @ApiProperty({ example: `mongooseGeneratedId` })
  singleVideoId: string;
}

export class EditVideoDetailsDTO {
  @ApiProperty({ example: `Video Collection's Title` })
  title: string;

  @ApiProperty({ example: `mongooseGeneratedId` })
  description: string;

  @ApiProperty({ example: `mongooseGeneratedId` })
  parentId: string;
}

export class DeleteSingleVideoDTO {
  @ApiProperty({ example: `mongooseGeneratedId` })
  parentId: string;

  @ApiProperty({ example: `mongooseGeneratedId` })
  videoId: string;
}

export class DeleteEntireVideoGroupDTO {
  @ApiProperty({ example: `mongooseGeneratedId` })
  parentVideoId: string;
}
