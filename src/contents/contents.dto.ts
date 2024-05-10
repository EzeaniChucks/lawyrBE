import { ApiProperty } from '@nestjs/swagger';

export class Contents {
  @ApiProperty({ example: 'folder', enum: ['folder', 'file'] })
  type: 'folder';

  @ApiProperty({ example: 'resource_name' })
  name: string;

  @ApiProperty({ example: 'folder' })
  resource: 'folder';

  @ApiProperty({ example: 'constitutional law' })
  searchTags: string[];
}

export class FullContentsDetails {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  _id: string;
  @ApiProperty({ example: 'mongooseGeneratedId' })
  creatorId: string;
  @ApiProperty({
    example: [
      {
        _id: 'mongooseGeneratedId',
        creatorId: 'mongooseGeneratedId',
        children: [{}],
        type: 'folder',
        name: '',
        resource: 'folder',
        searchTags: '',
        parentIds: ['mongooseGeneratedId1', 'mongooseGeneratedId2'],
        isSubscription: true,
        isPurchase: false,
        productPrice: 20,
        productPriceCurrency: 'NGN',
        subscriptionPrice: 30,
        subscriptionPriceCurrency: 'NGN',
        subscriptionDurationNo: 3,
        subscriptionDurationUnit: 'weeks',
        subscribedUsersIds: ['mongooseGeneratedId1', 'mongooseGeneratedId2'],
        paidUsersIds: ['mongooseGeneratedId1', 'mongooseGeneratedId2'],
      },
    ],
  })
  children: FullContentsDetails[];

  @ApiProperty({ example: 'folder', enum: ['folder', 'file'] })
  type: string;

  @ApiProperty({ example: 'folder_name' })
  name: string;

  @ApiProperty({ example: 'resource_name' })
  resource: 'folder';

  @ApiProperty({ example: 'constitutional law' })
  searchTags?: string[];

  @ApiProperty({ example: ['mongooseGeneratedId1', 'mongooseGeneratedId2'] })
  parentIds: string[];

  @ApiProperty({ example: true })
  isSubscription: boolean;

  @ApiProperty({ example: false })
  isPurchase: boolean;

  @ApiProperty({ example: 25 })
  productPrice: number;

  @ApiProperty({ example: 'NGN' })
  productPriceCurrency: string;

  @ApiProperty({ example: 200 })
  subscriptionPrice: number;

  @ApiProperty({ example: 'NGN' })
  subscriptionPriceCurrency: string;

  @ApiProperty({ example: 5 })
  subscriptionDurationNo: number;

  @ApiProperty({
    example: 'months',
    enum: ['days', 'weeks', 'months', 'years'],
  })
  subscriptionDurationUnit: string;

  @ApiProperty({ example: ['mongooseGeneratedId1', 'mongooseGeneratedId2'] })
  subscribedUsersIds: string[];

  @ApiProperty({ example: ['mongooseGeneratedId1', 'mongooseGeneratedId2'] })
  paidUsersIds: string[];
}

export class AddItemToUserAssetDTO {
  @ApiProperty({ example: 'mongooseGeneratedId1' })
  userId: string;

  @ApiProperty({
    example: {
      resourceName: 'audio | video | flashcard | mcq | essay | pdf | folder',
      resourceType: 'file | folder',
      resourceId: 'mongooseGeneratedId1',
      resourceParentIds: ['mongooseGeneratedId1', 'mongooseGeneratedId2'],
    },
  })
  item: {
    resourceName: string;
    resourceType: string;
    resourceId: string;
    resourceParentIds: string[];
  };

  @ApiProperty({
    example: 'mongooseGeneratedId1',
    enum: ['subscriptions array', 'purchases array', 'cart array'],
  })
  destination: 'subscriptions array' | 'purchases array' | 'cart array';
}

export class removeItemsFromUserAssetDTO {
  @ApiProperty({ example: 'mongooseGeneratedId1' })
  userId: string;

  @ApiProperty({
    example: {
      resourceId: 'mongooseGeneratedId1',
    },
  })
  item: {
    resourceId: string;
  };

  @ApiProperty({
    example: 'mongooseGeneratedId1',
    enum: ['subscriptions array', 'purchases array', 'cart array'],
  })
  destination: 'subscriptions array' | 'purchases array' | 'cart array';
}

export class DoesResourceExistSomewhereElseDTO {
  @ApiProperty({ example: 'mongooseGeneratedId1' })
  resourceId: string;

  @ApiProperty({ example: 'mongooseGeneratedId1' })
  resourceName: 'audio | video | flashcard | mcq | essay | pdf | folder';
}

export class CanResourceBeDeletedDTO {
  @ApiProperty({ example: 'mongooseGeneratedId1' })
  resourceId: string;

  @ApiProperty({ example: 'mongooseGeneratedId1' })
  resourceName: 'audio | video | flashcard | mcq | essay | pdf | folder';
}

export class CanFolderBeDeletedDTO {
  @ApiProperty({
    example: [
      {
        _id: 'mongooseGeneratedId',
        creatorId: 'mongooseGeneratedId',
        children: [{}],
        type: 'folder',
        name: '',
        resource: 'folder',
        searchTags: '',
        parentIds: ['mongooseGeneratedId1', 'mongooseGeneratedId2'],
        isSubscription: true,
        isPurchase: false,
        productPrice: 20,
        productPriceCurrency: 'NGN',
        subscriptionPrice: 30,
        subscriptionPriceCurrency: 'NGN',
        subscriptionDurationNo: 3,
        subscriptionDurationUnit: 'weeks',
        subscribedUsersIds: ['mongooseGeneratedId1', 'mongooseGeneratedId2'],
        paidUsersIds: ['mongooseGeneratedId1', 'mongooseGeneratedId2'],
      },
    ],
    description:
      'The children array field has the same schema as the parent. It can contain infite objects and these objects can go on to have their own children',
  })
  folder: FullContentsDetails;

  @ApiProperty({ example: 'mongooseGeneratedId1' })
  resourceName: 'audio | video | flashcard | mcq | essay | pdf | folder';
}

export class CanUserAccessResourceDTO {
  @ApiProperty({ example: 'mongooseGeneratedId1' })
  userId: string;

  @ApiProperty({ example: 'mongooseGeneratedId1' })
  resourceId: string;

  @ApiProperty({ example: 'mongooseGeneratedId1' })
  resourceName: 'audio | video | flashcard | mcq | essay | pdf | folder';
}

export class isUserSubActiveDTO {
  @ApiProperty({ example: 'mongooseGeneratedId1' })
  userId: string;

  @ApiProperty({ example: 'mongooseGeneratedId1' })
  contentId: string;

  @ApiProperty({ example: 'mongooseGeneratedId1' })
  resourceId: string;

  @ApiProperty({ example: 'mongooseGeneratedId1' })
  resourceName: 'audio | video | flashcard | mcq | essay | pdf | folder';
}

export class AddParentIDsToResourceDTO {
  @ApiProperty({ example: 'mongooseGeneratedId1' })
  resourceId: string;

  @ApiProperty({ example: 'mongooseGeneratedId1' })
  resourceName: 'audio | video | flashcard | mcq | essay | pdf | folder';

  @ApiProperty({ example: ['mongooseGeneratedId1', 'mongooseGeneratedId2'] })
  parentIdsArray: string[];
}

export class RemoveParentIDsFromResourceDTO {
  @ApiProperty({ example: 'mongooseGeneratedId1' })
  resourceId: string;

  @ApiProperty({ example: 'mongooseGeneratedId1' })
  resourceName: 'audio | video | flashcard | mcq | essay | pdf | folder';
}

export class MonifyResourceDTO {
  @ApiProperty({ example: 'mongooseGeneratedId1' })
  resourceId: string;

  @ApiProperty({ example: 'mongooseGeneratedId1' })
  resourceName: 'audio | video | flashcard | mcq | essay | pdf | folder';

  @ApiProperty({
    example: {
      purchasePrice: 0,
      subscriptionPrice: 100,
      subscriptionDurationNo: 2,
      subscriptionDurationUnit: 'months',
      isSubscription: true,
      isPurchase: false,
    },
  })
  settingsObj: {
    purchasePrice?: number;
    subscriptionPrice?: number;
    subscriptionDurationNo?: number;
    subscriptionDurationUnit?: string;
    isSubscription: boolean;
    isPurchase: boolean;
  };
}

export class adduserIdsToResourcePaymentArraysDTO {
  @ApiProperty({ example: 'mongooseGeneratedId1' })
  resourceId: string;

  @ApiProperty({ example: 'mongooseGeneratedId1' })
  resourceName: 'audio | video | flashcard | mcq | essay | pdf | folder';

  @ApiProperty({
    example: {
      subscribedUsersIds: {
        userName: 'John Doe',
        userId: 'mongooseGeneratedId',
        expiryDate: new Date(),
      },
      paidUsersIds: { userName: 'Susan Doe', userId: 'mongooseGeneratedId' },
    },
  })
  settingsObj: {
    subscribedUsersIds: {
      userName: string;
      userId: string;
      expiryDate: string | Date;
    };
    paidUsersIds: { userName: string; userId: string };
  };
}

export class UnMonifyResourceDTO {
  @ApiProperty({ example: 'mongooseGeneratedId1' })
  resourceId: string;

  @ApiProperty({ example: 'mongooseGeneratedId1' })
  resourceName: 'audio | video | flashcard | mcq | essay | pdf | folder';
}
