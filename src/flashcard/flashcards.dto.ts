export class cardDetailsDTO {
  title: string;
  description: string;
}
export class cardQAPairDTO {
  question: string;
  answer: string;
}

export class cardIdDTO {
  flashcardId: string;
}

export class cardBody {
  details: cardDetailsDTO;
  qaPair: cardQAPairDTO[];
}
