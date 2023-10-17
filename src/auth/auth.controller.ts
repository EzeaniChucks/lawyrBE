import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO, RegisterDTO } from './auth.dto';
import { Response, Request } from 'express';
import { MCQScenarios, MCQuestionsDTO, mcqDetailsDTO } from 'src/mcqs/mcqs.dto';
import { Date } from 'mongoose';

@Controller('auth')
export class AuthController {
  constructor(private readonly authsevice: AuthService) {}
  @Get('is_logged_in')
  async isLoggedIn(@Res() res: Response, @Req() req: Request) {
    return await this.authsevice.isLoggedIn(req, res);
  }

  @Get('is_admin')
  async isAdmin(@Res() res: Response, @Req() req: Request) {
    return await this.authsevice.isAdmin(req, res);
  }

  @Get('full_user_details')
  async fullUserDetails(@Res() res: Response, @Req() req: Request) {
    return await this.authsevice.getFullUserDetails(req, res);
  }

  @Post('login')
  async login(@Body() body: LoginDTO, @Res() res: Response) {
    return await this.authsevice.login(body, res);
  }

  @Post('register')
  async register(@Body() body: RegisterDTO, @Res() res: Response) {
    return await this.authsevice.register(body, res);
  }

  @Get('logout')
  async signout(@Res() res: Response) {
    return this.authsevice.signout(res);
  }

  @Post('start_mcq_test')
  async startMcqTest(
    @Body()
    body: {
      userId: string;
      mcq: {
        creatorId: string;
        clonedresourceId: string;
        mcqDetails: mcqDetailsDTO;
        QAs: MCQuestionsDTO[];
        scenarios: MCQScenarios[];
        expiryDate: Date;
      };
    },
    @Res() res: Response,
  ) {
    const { userId, mcq } = body;
    return this.authsevice.startMCQTest(userId, mcq, res);
  }

  @Get('fetch_current_ongoing_mcq/:userId/:mcqId')
  async fetchCurrentOngoingMCQ(
    @Param()
    param: {
      userId: string;
      mcqId: string;
    },
    @Res() res: Response,
  ) {
    const { userId, mcqId } = param;
    return this.authsevice.fetchCurrentOngoingMCQ(userId, mcqId, res);
  }
  @Get('fetch_all_completed_mcqs/:userId')
  async fetchAllCompletedMCQs(
    @Param()
    param: {
      userId: string;
    },
    @Res() res: Response,
  ) {
    const { userId } = param;
    return this.authsevice.fetchAllCompletedMCQs(userId, res);
  }

  @Put('edit_ongoing_mcq')
  async editOngoingMCQ(
    @Body()
    body: {
      userId: string;
      QAs: MCQuestionsDTO[];
      mcqId: string;
    },
    @Res() res: Response,
  ) {
    const { userId, mcqId, QAs } = body;
    return this.authsevice.editOngoingMCQ(userId, QAs, mcqId, res);
  }
  @Put('end_ongoing_mcq')
  async endOngoingMCQ(
    @Body()
    body: {
      userId: string;
      QAs: MCQuestionsDTO[];
      mcqId: string;
    },
    @Res() res: Response,
  ) {
    const { userId, mcqId, QAs } = body;
    return this.authsevice.endOngoingMCQ(userId, QAs, mcqId, res);
  }

  @Post('start_group_mcq_test')
  async startGroupMcqTest(
    @Body()
    body: {
      userId: string;
      mcq: {
        grouptestId: string;
        creatorId: string;
        clonedresourceId: string;
        mcqDetails: mcqDetailsDTO;
        QAs: MCQuestionsDTO[];
        scenarios: MCQScenarios[];
        expiryDate: Date;
      };
    },
    @Res() res: Response,
  ) {
    const { userId, mcq } = body;
    return this.authsevice.startGroupMCQTest(userId, mcq, res);
  }

  @Get('fetch_current_ongoing_group_mcq/:userId/:mcqId')
  async fetchCurrentOngoingGroupMCQ(
    @Param()
    param: {
      userId: string;
      mcqId: string;
    },
    @Res() res: Response,
  ) {
    const { userId, mcqId } = param;
    return this.authsevice.fetchCurrentOngoingGroupMCQ(userId, mcqId, res);
  }
  @Get('fetch_all_completed_group_mcqs/:userId')
  async fetchAllCompletedGroupMCQs(
    @Param()
    param: {
      userId: string;
    },
    @Res() res: Response,
  ) {
    const { userId } = param;
    return this.authsevice.fetchAllCompletedGroupMCQs(userId, res);
  }

  @Put('edit_ongoing_group_mcq')
  async editOngoingGroupMCQ(
    @Body()
    body: {
      userId: string;
      QAs: MCQuestionsDTO[];
      mcqId: string;
    },
    @Res() res: Response,
  ) {
    const { userId, mcqId, QAs } = body;
    return this.authsevice.editOngoingGroupMCQ(userId, QAs, mcqId, res);
  }
  @Put('end_ongoing_group_mcq')
  async endOngoingGroupMCQ(
    @Body()
    body: {
      userId: string;
      QAs: MCQuestionsDTO[];
      mcqId: string;
    },
    @Res() res: Response,
  ) {
    const { userId, mcqId, QAs } = body;
    return this.authsevice.endOngoingGroupMCQ(userId, QAs, mcqId, res);
  }
}