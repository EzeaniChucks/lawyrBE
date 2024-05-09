import { ApiProperty } from '@nestjs/swagger';

export class mcqDetailsDTO {
  title: string;
  description: string;
}

export class mcqIdDTO {
  mcqId: string;
}

export class MCQuestionsDTO {
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
}

export class MCQScenarios {
  text: string;
  linkedTo: string[];
}

export class MCQBodyDTO {
  scenarios: MCQScenarios[];
  QAs: MCQuestionsDTO[];
}

export class mcqBodyANDDetails {
  details: mcqDetailsDTO;
  mcqBody: MCQBodyDTO;
}

export class CreateMCQDTO {
  @ApiProperty({
    example: {
      title: 'title of MCQ',
      description: `What topic is the MCQs addressing? What is its aim?`,
    },
  })
  details: mcqDetailsDTO;

  @ApiProperty({
    example: {
      scenarios: [
        {
          text: 'A scenerio text. Can be conceptualize so multiple questions will draw their premise from it.',
          linkedTo: ['2', '4', '8'],
        },
      ],
      QAs: [
        {
          _id: 'mongooseGeneratedId',
          question: 'What is constitutional law',
          type: '',
          questionNum: '1',
          A: 'The law that governs a people',
          B: 'The law that focuses on the constitution',
          C: 'The law that forms the constitution',
          D: 'The constitution that forms the law',
          answer: 'B',
          candidate_answer: 'C',
          explanation: 'Whay is B the answer? Explain this point to your users',
        },
      ],
    },
  })
  mcqBody: MCQBodyDTO;
}

export class UpdateMCQDTO {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  mcqId: string;

  @ApiProperty({
    example: {
      details: {
        title: 'title of MCQ',
        description: `What topic is the MCQs addressing? What is its aim?`,
      },
      mcqBody: {
        scenarios: [
          {
            text: 'A scenerio text. Can be conceptualize so multiple questions will draw their premise from it.',
            linkedTo: ['2', '4', '8'],
          },
        ],
        QAs: [
          {
            _id: 'mongooseGeneratedId',
            question: 'What is constitutional law',
            type: '',
            questionNum: '1',
            A: 'The law that governs a people',
            B: 'The law that focuses on the constitution',
            C: 'The law that forms the constitution',
            D: 'The constitution that forms the law',
            answer: 'B',
            candidate_answer: 'C',
            explanation:
              'Whay is B the answer? Explain this point to your users',
          },
        ],
      },
    },
  })
  mcqBEObject: mcqBodyANDDetails;
}

export class CreateAGroupTest {
  @ApiProperty({
    example: {
      testObj: {
        numberOfQuestions: 12,
        numberOfScenarios: 3,
        creatorId: 'mongooseGeneratedId',
        details: {
          title: 'test title as determined by mcq creator',
          description: 'description as determined by mcq creator',
        },
        testParticipantsIds: [{ userId: '', userName: '' }],
        initialTestParticipants: [
          {
            userId: 'mongooseGeneratedId',
            userName: 'John Doe',
            canTakeTest: false,
          },
        ],
        clonedresourceId: 'mongooseGeneratedId',
        testStartTimeMilliseconds: Date.now(),
      },
    },
  })
  testObj: {
    numberOfQuestions: number;
    numberOfScenarios: number;
    creatorId: string;
    details: { title: string; description: string };
    testParticipantsIds: { userId: string; userName: string }[];
    initialTestParticipants: {
      userId: string;
      userName: string;
      canTakeTest: boolean;
    }[];
    clonedresourceId: string;
    testStartTimeMilliseconds: number;
  };
}

export class FetchAGroupTest {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  grouptestId: string;

  @ApiProperty({ example: 'mongooseGeneratedId' })
  userId: string;
}

export class DeleteAGroupTest {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  grouptestId: string;

  @ApiProperty({ example: 'mongooseGeneratedId' })
  userId: string;
}

export class EndAGroupTest {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  grouptestId: string;
}

export class InviteUsersToGroupTest {
  @ApiProperty({
    example: [{ userId: 'mongooseGeneratedId', userName: 'John Doe' }],
  })
  inviteesIdArrays: { userId: string; userName: string }[];

  @ApiProperty({ example: 'mongooseGeneratedId' })
  originalmcqId: string;

  @ApiProperty({ example: 'mongooseGeneratedId' })
  grouptestId: string;

  @ApiProperty({ example: 'mongooseGeneratedId' })
  folderId: string;

  @ApiProperty({ example: 'Name of Folder' })
  folderName: string;
}

export class ViewResultsWithCorrections {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  grouptestId: string;

  @ApiProperty({ example: 'mongooseGeneratedId' })
  userId: string;
}
