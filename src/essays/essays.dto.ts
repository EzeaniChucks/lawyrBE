export class essayDetailsDTO {
  title: string;
  description: string;
}

export class essayIdDTO {
  essayId: string;
}

export type essayQuestionsDTO = {
  question: string;
  type: string;
  questionNum: string | number;
  A: string;
  B: string;
  C: string;
  D: string;
  answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
};

export type essayBodyDTO = {
  scenarios: {
    text: string;
    linkedTo: string[];
  }[];
  QAs: essayQuestionsDTO[];
  QAview:string;
};
export class essayBodyANDDetails {
  details: essayDetailsDTO;
  essayBody: essayBodyDTO;
}
