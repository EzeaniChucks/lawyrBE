import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt } from 'class-validator';
import { MCQScenarios, MCQuestionsDTO, mcqDetailsDTO } from 'src/mcqs/mcqs.dto';

export class RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export class LoginDTO {
  email: string;
  password: string;
}
export class VerifyEmailDTO {
  @ApiProperty({
    example: 'hexStringGeneratedFromNodejsCryptoModule',
  })
  verificationToken: string;

  @ApiProperty({
    example: 'email@certainsite.com',
  })
  email: string;
}
export class VerifyEmailResponseDTO {
  @ApiProperty({
    example: 'email verified',
  })
  msg: string;

  @ApiProperty({
    example: {
      _id: 'mongooseGeneratedId',
      email: 'useremail@certainsite.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+23496900922222',
    },
  })
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
}

export class UserDetailsResponseDTO {
  @IsString()
  _id: string;
  @IsInt()
  name: string;
  @IsString()
  isAdmin: boolean;
}

export class sendResetPassToEmailDTO {
  @ApiProperty({ example: 'someone@examplesite.com' })
  email: string;
}

export class ResetPasswordDTO {
  @ApiProperty({ example: 'anAppGeneratedHexStringFromNodejsCyptoModule' })
  resetToken: string;

  @ApiProperty({ example: 'someone@examplesite.com' })
  email: string;

  @ApiProperty({ example: 'yourNewPassword222' })
  password: string;
}

export class startMCQTestDTO {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  userId: string;

  @ApiProperty({
    example: {
      creatorId: 'mongooseGeneratedId',
      clonedresourceId: 'mongooseGeneratedId',
      mcqDetails: {
        title: 'WhatYouWishToNameTheMCQ',
        description: 'A detailed description of what the mcq hopes to solve.',
      },
      QAs: [
        {
          _id: 'mongooseGeneratedId',
          question: 'What would you like the question to be?',
          // type: '',
          questionNum: '1',
          A: 'option A sentence in line with the question above',
          B: 'option B sentence in line with the question above',
          C: 'option C sentence in line with the question above',
          D: 'option D sentence in line with the question above',
          answer: 'C',
          candidate_answer: 'D',
          explanation: `You can optionally give a detailed description of why the answer is C. This description appears during candidate's review of answers after test is taken`,
        },
      ],
      scenarios: [
        {
          text: 'A detailed created scenerio which some questions will be based on',
          linkedTo: ['1', '2', '4'],
        },
      ],
      expiryDate: new Date().toDateString(),
    },
  })
  mcq: {
    creatorId: string;
    clonedresourceId: string;
    mcqDetails: mcqDetailsDTO;
    QAs: MCQuestionsDTO[];
    scenarios: MCQScenarios[];
    expiryDate: String;
  };
}

export class FetchCurrentOngoingMCQ {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  userId: string;

  @ApiProperty({ example: 'mongooseGeneratedId' })
  mcqId: string;
}
export class FetchAllCompletedMCQ {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  userId: string;
}
export class FetchAllCompletedGroupTest {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  userId: string;
}

export class EditOngoingMCQDTO {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  userId: string;
  @ApiProperty({ example: 'mongooseGeneratedId' })
  mcqId: string;

  @ApiProperty({
    example: {
      QAs: [
        {
          _id: 'mongooseGeneratedId',
          question: 'What would you like the question to be?',
          // type: '',
          questionNum: '1',
          A: 'option A sentence in line with the question above',
          B: 'option B sentence in line with the question above',
          C: 'option C sentence in line with the question above',
          D: 'option D sentence in line with the question above',
          answer: 'C',
          candidate_answer: 'D',
          explanation: `You can optionally give a detailed description of why the answer is C. This description appears during candidate's review of answers after test is taken`,
        },
      ],
    },
  })
  QAs: MCQuestionsDTO[];
}

export class EndOngoingMCQDTO {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  userId: string;
  @ApiProperty({ example: 'mongooseGeneratedId' })
  mcqId: string;

  @ApiProperty({
    example: {
      QAs: [
        {
          _id: 'mongooseGeneratedId',
          question: 'What would you like the question to be?',
          type: '',
          questionNum: '1',
          A: 'option A sentence in line with the question above',
          B: 'option B sentence in line with the question above',
          C: 'option C sentence in line with the question above',
          D: 'option D sentence in line with the question above',
          answer: 'C',
          candidate_answer: 'D',
          explanation: `You can optionally give a detailed description of why the answer is C. This description appears during candidate's review of answers after test is taken`,
        },
      ],
    },
  })
  QAs: MCQuestionsDTO[];
}

export class startMCQGroupTestDTO {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  userId: string;

  @ApiProperty({
    example: {
      grouptestId: 'mongooseGeneratedId',
      creatorId: 'mongooseGeneratedId',
      clonedresourceId: 'mongooseGeneratedId',
      mcqDetails: {
        title: 'WhatYouWishToNameTheMCQ',
        description: 'A detailed description of what the mcq hopes to solve.',
      },
      QAs: [
        {
          _id: 'mongooseGeneratedId',
          question: 'What would you like the question to be?',
          type: '',
          questionNum: '1',
          A: 'option A sentence in line with the question above',
          B: 'option B sentence in line with the question above',
          C: 'option C sentence in line with the question above',
          D: 'option D sentence in line with the question above',
          answer: 'C',
          candidate_answer: 'D',
          explanation: `You can optionally give a detailed description of why the answer is C. This description appears during candidate's review of answers after test is taken`,
        },
      ],
      scenarios: [
        {
          text: 'A detailed created scenerio which some questions will be based on',
          linkedTo: ['1', '2', '4'],
        },
      ],
      expiryDate: new Date().toDateString(),
    },
  })
  mcq: {
    grouptestId: string;
    creatorId: string;
    clonedresourceId: string;
    mcqDetails: mcqDetailsDTO;
    QAs: MCQuestionsDTO[];
    scenarios: MCQScenarios[];
    expiryDate: String;
  };
}

export class fetchCurrentOngoingGroupMCQDTO {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  userId: string;

  @ApiProperty({ example: 'mongooseGeneratedId' })
  mcqId: string;
}
export class FetchAllCompletedGroupMCQDTO {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  userId: string;
}
