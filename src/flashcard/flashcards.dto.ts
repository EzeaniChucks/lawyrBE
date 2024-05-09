import { ApiProperty } from '@nestjs/swagger';

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
  @ApiProperty({
    example: {
      title: 'Title for Flashcard',
      description:
        'Detailed description to help users understand the premise of the flashcard; what it hopes to achieve',
    },
  })
  details: cardDetailsDTO;

  @ApiProperty({
    example: [
      {
        question:
          'What is your question. Should be short but can in two or three paragraphs',
        answer: `Your answer to the above question. This will display on the flashcard's flip side`,
      },
    ],
  })
  qaPair: cardQAPairDTO[];
}

export class UpdateFlashCard {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  flashcardId: cardIdDTO;
  @ApiProperty({
    example: {
      details: {
        title: 'Title for Flashcard',
        description:
          'Detailed description to help users understand the premise of the flashcard; what it hopes to achieve',
      },
      qaPair: [
        {
          question:
            'What is your question. Should be short but can in two or three paragraphs',
          answer: `Your answer to the above question. This will display on the flashcard's flip side`,
        },
        {
          question:
            'What is your second question. Should be short but can in two or three paragraphs',
          answer: `Your answer to the above question. This will display on the flashcard's flip side`,
        },
      ],
    },
  })
  cardBody: cardBody;
}
