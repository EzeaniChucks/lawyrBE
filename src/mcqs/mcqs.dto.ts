export class mcqDetailsDTO {
  title: string;
  description: string;
}

export class mcqIdDTO {
  mcqId: string;
}

export type MCQuestionsDTO = {
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

export type MCQBodyDTO = {
  scenarios: {
    text: string;
    linkedTo: string[];
  }[];
  QAs: MCQuestionsDTO[];
};
export class mcqBodyANDDetails {
  details: mcqDetailsDTO;
  mcqBody: MCQBodyDTO;
}
