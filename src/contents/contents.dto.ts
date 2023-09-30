export type Contents = {
  type: 'folder';
  name: string;
  resource: 'folder';
  searchTags: string[];
};

export type FullContentsDetails = {
  _id: string;
  creatorId: string;
  children: FullContentsDetails[];
  type: 'folder';
  name: string;
  resource: 'folder';
  searchTags?: string[];
  parentIds: string[];
  isSubscription: boolean;
  isPurchase: boolean;
  productPrice: number;
  productPriceCurrency: string;
  subscriptionPrice: number;
  subscriptionPriceCurrency: string;
  subscriptionDurationNo: number;
  subscriptionDurationUnit: 'days' | 'weeks' | 'months' | 'years';
  subscribedUsersIds: string[];
  paidUsersIds: string[];
};
