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
import {
  EditOngoingMCQDTO,
  EndOngoingMCQDTO,
  FetchAllCompletedGroupTest,
  FetchAllCompletedMCQ,
  FetchCurrentOngoingMCQ,
  LoginDTO,
  RegisterDTO,
  ResetPasswordDTO,
  UserDetailsResponseDTO,
  fetchCurrentOngoingGroupMCQDTO,
  sendResetPassToEmailDTO,
  startMCQGroupTestDTO,
  startMCQTestDTO,
} from './auth.dto';
import { Response, Request } from 'express';
import { MCQScenarios, MCQuestionsDTO, mcqDetailsDTO } from 'src/mcqs/mcqs.dto';
import { Date } from 'mongoose';
import { ApiBody, ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authsevice: AuthService) {}

  @Get('is_logged_in')
  @ApiResponse({ status: 200, description: 'Returns true. User is logged in' })
  @ApiResponse({
    status: 400,
    description: 'Returns false. User cookie has expired',
    // links:{}
  })
  @ApiBody({ type: 'cookie string' })
  async isLoggedIn(@Res() res: Response, @Req() req: Request) {
    return await this.authsevice.isLoggedIn(req, res);
  }

  @Get('is_admin')
  @ApiResponse({ status: 200, description: 'Returns true. User is admin' })
  @ApiResponse({
    status: 400,
    description: 'Returns false. User is not admin',
  })
  @ApiBody({ type: 'cookie string' })
  async isAdmin(@Res() res: Response, @Req() req: Request) {
    return await this.authsevice.isAdmin(req, res);
  }

  @Get('full_user_details')
  @ApiResponse({ status: 200, description: 'Returns true. User is logged in' })
  @ApiResponse({
    status: 400,
    description: 'Returns false. User cookie has expired',
  })
  @ApiBody({ type: 'cookie string' })
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

  //send reset pass request to email
  @Post('auth/send_reset_pass_to_email')
  @ApiTags('Auth')
  async sendResetPassToEmail(
    @Body() body: sendResetPassToEmailDTO,
    @Res() res: Response,
  ) {
    return this.authsevice.sendResetPassToEmail(body?.email, res);
  }

  //reset password
  @Post('auth/reset_passwords')
  @ApiTags('Auth')
  async sendResetPass(@Body() body: ResetPasswordDTO, @Res() res: Response) {
    const { resetToken, email, password } = body;
    return this.authsevice.resetPassword(resetToken, email, password, res);
  }

  @Get('logout')
  async signout(@Res() res: Response) {
    return this.authsevice.signout(res);
  }

  @Post('start_mcq_test')
  async startMcqTest(
    @Body()
    body: startMCQTestDTO,
    @Res() res: Response,
  ) {
    const { userId, mcq } = body;
    return this.authsevice.startMCQTest(userId, mcq, res);
  }

  @Get('fetch_current_ongoing_mcq/:userId/:mcqId')
  async fetchCurrentOngoingMCQ(
    @Param()
    param: FetchCurrentOngoingMCQ,
    @Res() res: Response,
  ) {
    const { userId, mcqId } = param;
    return this.authsevice.fetchCurrentOngoingMCQ(userId, mcqId, res);
  }

  @Get('fetch_all_completed_mcqs/:userId')
  async fetchAllCompletedMCQs(
    @Param()
    param: FetchAllCompletedMCQ,
    @Res() res: Response,
  ) {
    const { userId } = param;
    return this.authsevice.fetchAllCompletedMCQs(userId, res);
  }

  @Get('fetch_all_completed_grouptests/:userId')
  async fetchAllCompletedGroupTests(
    @Param()
    param: FetchAllCompletedGroupTest,
    @Res() res: Response,
  ) {
    const { userId } = param;
    return this.authsevice.fetchAllCompletedGroupTests(userId, res);
  }

  @Put('edit_ongoing_mcq')
  async editOngoingMCQ(
    @Body()
    body: EditOngoingMCQDTO,
    @Res() res: Response,
  ) {
    const { userId, mcqId, QAs } = body;
    return this.authsevice.editOngoingMCQ(userId, QAs, mcqId, res);
  }

  @Put('end_ongoing_mcq')
  async endOngoingMCQ(
    @Body()
    body: EndOngoingMCQDTO,
    @Res() res: Response,
  ) {
    const { userId, mcqId, QAs } = body;
    return this.authsevice.endOngoingMCQ(userId, QAs, mcqId, res);
  }

  @Post('start_group_mcq_test')
  async startGroupMcqTest(
    @Body()
    body: startMCQGroupTestDTO,
    @Res() res: Response,
  ) {
    const { userId, mcq } = body;
    return this.authsevice.startGroupMCQTest(userId, mcq, res);
  }

  @Get('fetch_current_ongoing_group_mcq/:userId/:mcqId')
  async fetchCurrentOngoingGroupMCQ(
    @Param()
    param: fetchCurrentOngoingGroupMCQDTO,
    @Res() res: Response,
  ) {
    const { userId, mcqId } = param;
    return this.authsevice.fetchCurrentOngoingGroupMCQ(userId, mcqId, res);
  }

  @Get('fetch_all_completed_group_mcqs/:userId')
  async fetchAllCompletedGroupMCQs(
    @Param()
    param: FetchAllCompletedGroupTest,
    @Res() res: Response,
  ) {
    const { userId } = param;
    return this.authsevice.fetchAllCompletedGroupMCQs(userId, res);
  }

  @Put('edit_ongoing_group_mcq')
  async editOngoingGroupMCQ(
    @Body()
    body: EditOngoingMCQDTO,
    @Res() res: Response,
  ) {
    const { userId, mcqId, QAs } = body;
    return this.authsevice.editOngoingGroupMCQ(userId, QAs, mcqId, res);
  }
  @Put('end_ongoing_group_mcq')
  async endOngoingGroupMCQ(
    @Body()
    body: EndOngoingMCQDTO,
    @Res() res: Response,
  ) {
    const { userId, mcqId, QAs } = body;
    return this.authsevice.endOngoingGroupMCQ(userId, QAs, mcqId, res);
  }
}