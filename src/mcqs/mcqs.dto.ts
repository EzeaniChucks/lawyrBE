export class mcqDetailsDTO {
  title: string;
  description: string;
}

export class mcqIdDTO {
  mcqId: string;
}

export type MCQuestionsDTO = {
  _id?: string;
  question: string;
  type: string;
  questionNum: string | number;
  A: string;
  B: string;
  C: string;
  D: string;
  answer: 'A' | 'B' | 'C' | 'D';
  candidate_answer?: string;
  explanation: string;
};

export type MCQScenarios = {
  text: string;
  linkedTo: string[];
};
export type MCQBodyDTO = {
  scenarios: MCQScenarios[];
  QAs: MCQuestionsDTO[];
};
export class mcqBodyANDDetails {
  details: mcqDetailsDTO;
  mcqBody: MCQBodyDTO;
}
