import { ApiProperty } from '@nestjs/swagger';

export class essayDetailsDTO {
  @ApiProperty({ example: 'essay title' })
  title: string;
  @ApiProperty({
    example:
      'Detailed essay description. What is the aim and do students stand to benefit after the questions and answers',
  })
  description: string;
}

export class essayIdDTO {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  essayId: string;
}

export class essayQuestionsDTO {
  question: string;
  type: string;
  questionNum: string | number;
  A: string;
  B: string;
  C: string;
  D: string;
  answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export class essayBodyDTO {
  scenarios: {
    text: string;
    linkedTo: string[];
  }[];
  QAs: essayQuestionsDTO[];
  QAview: string;
}
export class essayBodyANDDetails {
  details: essayDetailsDTO;
  essayBody: essayBodyDTO;
}

export class UpdateEssayDTO {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  essayId: string;

  @ApiProperty({
    example: {
      details: {
        title: 'Title of your essay',
        description:
          'Detailed description to help users understand the premise of the essay; what it hopes to achieve',
      },
      essayBody: {
        scenarios: {
          text: 'your scenerio text. Word lenght is unlimited. You can submit via textbox and paragraph spaces will be retained',
          linkedTo: ['2', '5', '6', '9'],
        },
        QAs: [
          {
            question: 'What will your question be?',
            type: '',
            questionNum: '1',
            A: 'option A text',
            B: 'option B text',
            C: 'option C text',
            D: 'option D text',
            answer: 'A',
            explanation:
              'Essays have no correct answers. But there is usually a best answer. Why is A the best answer? Tell your users.',
          },
        ],
        QAview: 'horizontal | vertical',
      },
    },
  })
  essayBEObject: essayBodyANDDetails;
}

export class CreateEssayDTO {
  @ApiProperty({
    example: {
      title: 'Title of your essay',
      description:
        'Detailed description to help users understand the premise of the essay; what it hopes to achieve',
    },
  })
  details: essayDetailsDTO;

  @ApiProperty({
    example: {
      scenarios: {
        text: 'your scenerio text. Word lenght is unlimited. You can submit via textbox and paragraph spaces will be retained',
        linkedTo: ['2', '5', '6', '9'],
      },
      QAs: [
        {
          question: 'What will your question be?',
          type: '',
          questionNum: '1',
          A: 'option A text',
          B: 'option B text',
          C: 'option C text',
          D: 'option D text',
          answer: 'A',
          explanation:
            'Essays have no correct answers. But there is usually a best answer. Why is A the best answer? Tell your users.',
        },
      ],
      QAview: 'horizontal | vertical',
    },
  })
  essayBody: essayBodyDTO;
}
