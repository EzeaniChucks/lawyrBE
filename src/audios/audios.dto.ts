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
