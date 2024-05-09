import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { cardBody, cardIdDTO } from 'src/flashcard/flashcards.dto';
import { McqsService } from './mcqs.service';
import {
  CreateAGroupTest,
  CreateMCQDTO,
  DeleteAGroupTest,
  EndAGroupTest,
  FetchAGroupTest,
  InviteUsersToGroupTest,
  UpdateMCQDTO,
  ViewResultsWithCorrections,
  mcqBodyANDDetails,
  mcqIdDTO,
} from './mcqs.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('mcqs')
@ApiTags('MCQs')
export class McqsController {
  constructor(private readonly mcqservice: McqsService) {}

  @Post('create_mcq')
  async createMCQ(
    @Body() body: CreateMCQDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { details, mcqBody } = body;
    return await this.mcqservice.createMCQ(details, mcqBody, req, res);
  }

  @Get('get_mcq/:mcqId')
  async getMCQ(
    @Param() param: mcqIdDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { mcqId } = param;
    return await this.mcqservice.getMCQ(mcqId, res);
  }

  @Get('get_all_mcqs')
  async getAllMCQs(@Req() req: Request, @Res() res: Response) {
    return await this.mcqservice.getAllMCQs(req, res);
  }

  @Put('update_mcq')
  async updateMCQ(
    @Body() body: UpdateMCQDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { mcqId, mcqBEObject } = body;
    const { details, mcqBody } = mcqBEObject;
    return await this.mcqservice.updateMCQ(mcqId, details, mcqBody, req, res);
  }

  @Delete('delete_mcq/:mcqId')
  async deleteMCQ(
    @Param() param: mcqIdDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { mcqId } = param;
    return await this.mcqservice.deleteMCQ(mcqId, req, res);
  }

  @Post('create_a_group_test')
  async createAGroupTest(
    @Body()
    body: CreateAGroupTest,
    @Res() res: Response,
  ) {
    const { testObj } = body;
    return await this.mcqservice.createAGroupTest(testObj, res);
  }

  @Get('fetch_a_group_test/:grouptestId/:userId')
  async fetchAGroupTest(@Param() param: FetchAGroupTest, @Res() res: Response) {
    const { grouptestId, userId } = param;
    return await this.mcqservice.fetchAGroupTest(grouptestId, userId, res);
  }

  @Delete('delete_a_group_test/:grouptestId/:userId')
  async deleteAGroupTest(
    @Param() param: DeleteAGroupTest,
    @Res() res: Response,
  ) {
    const { grouptestId, userId } = param;
    return await this.mcqservice.deleteAGroupTest(grouptestId, userId, res);
  }

  @Put('end_a_group_test')
  async endAGroupTest(@Body() body: EndAGroupTest, @Res() res: Response) {
    const { grouptestId } = body;
    return await this.mcqservice.endAGroupTest(grouptestId, res);
  }

  @Get('search_users_to_invite_to_group_test/:searchWord')
  async searchUsersToInviteToGroupTest(
    @Param('searchWord') searchWord: string,
    @Res() res: Response,
  ) {
    return await this.mcqservice.searchUsersToInviteToGroupTest(
      searchWord,
      res,
    );
  }

  @Post('invite_users_to_group_test')
  async inviteFriendsToGroupTest(
    @Body()
    body: InviteUsersToGroupTest,
    @Res() res: Response,
  ) {
    const {
      inviteesIdArrays,
      originalmcqId,
      grouptestId,
      folderId,
      folderName,
    } = body;
    return await this.mcqservice.inviteFriendsToGroupTest(
      inviteesIdArrays,
      originalmcqId,
      grouptestId,
      folderId,
      folderName,
      res,
    );
  }

  @Get('view_results_with_corrections/:grouptestId/:userId')
  async viewResultsWithCorrections(
    @Param()
    param: ViewResultsWithCorrections,
    @Res() res: Response,
  ) {
    const { grouptestId, userId } = param;
    return await this.mcqservice.viewResultsWithCorrections({
      grouptestId,
      userId,
      res,
    });
  }
}