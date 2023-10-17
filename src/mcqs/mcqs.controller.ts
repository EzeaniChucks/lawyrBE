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
import { mcqBodyANDDetails, mcqIdDTO } from './mcqs.dto';

@Controller('mcqs')
export class McqsController {
  constructor(private readonly mcqservice: McqsService) {}
  @Post('create_mcq')
  async createMCQ(
    @Body() body: mcqBodyANDDetails,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { details, mcqBody } = body;
    return await this.mcqservice.createMCQ(details, mcqBody, req, res);
  }

  @Get('get_mcq/:mcqId')
  async getMCQ(
    @Param('mcqId') mcqId: mcqIdDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.mcqservice.getMCQ(mcqId, res);
  }
  @Get('get_all_mcqs')
  async getAllMCQs(@Req() req: Request, @Res() res: Response) {
    return await this.mcqservice.getAllMCQs(req, res);
  }

  @Put('update_mcq')
  async updateMCQ(
    @Body() body: { mcqId: mcqIdDTO; mcqBEObject: mcqBodyANDDetails },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { mcqId, mcqBEObject } = body;
    const { details, mcqBody } = mcqBEObject;
    return await this.mcqservice.updateMCQ(mcqId, details, mcqBody, req, res);
  }

  @Delete('delete_mcq/:mcqId')
  async deleteMCQ(
    @Param('mcqId') mcqId: mcqIdDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.mcqservice.deleteMCQ(mcqId, req, res);
  }

  @Post('create_a_group_test')
  async createAGroupTest(@Body() body: any, @Res() res: Response) {
    const { testObj } = body;
    return await this.mcqservice.createAGroupTest(testObj, res);
  }

  @Get('fetch_a_group_test/:grouptestId/:userId')
  async fetchAGroupTest(
    @Param() param: { grouptestId: mcqIdDTO; userId: string },
    @Res() res: Response,
  ) {
    const { grouptestId, userId } = param;
    return await this.mcqservice.fetchAGroupTest(grouptestId, userId, res);
  }

  @Delete('delete_a_group_test/:grouptestId/:userId')
  async deleteAGroupTest(
    @Param() param: { grouptestId: mcqIdDTO; userId: string },
    @Res() res: Response,
  ) {
    const { grouptestId, userId } = param;
    return await this.mcqservice.deleteAGroupTest(grouptestId, userId, res);
  }

  @Put('end_a_group_test')
  async endAGroupTest(
    @Body() body: { grouptestId: mcqIdDTO },
    @Res() res: Response,
  ) {
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
    body: {
      inviteesIdArrays: { userId: string; userName: string }[];
      originalmcqId: string;
      grouptestId: string;
      folderId: string;
      folderName: string;
    },
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
    param: {
      grouptestId: string;
      userId: string;
    },
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