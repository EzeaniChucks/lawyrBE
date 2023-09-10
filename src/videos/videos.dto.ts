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
