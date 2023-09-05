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
import { mcqBodyANDDetails } from './mcqs.dto';

@Controller('mcqs')
export class McqsController {
  constructor(private readonly mcqservice: McqsService) {}
  @Post('create_mcq')
  async createFlashCard(
    @Body() body: mcqBodyANDDetails,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { details, mcqBody } = body;
    return await this.mcqservice.createFlashCard(details, mcqBody, req, res);
  }
  @Get('get_mcq/:mcqId')
  async getFlashCard(
    @Param('mcqId') mcqId: cardIdDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.mcqservice.getFlashCard(mcqId, res);
  }
  @Get('get_all_mcqs')
  async getAllFlashCards(
    // @Param('flashcardId') flashcardId: cardIdDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.mcqservice.getAllFlashCards(req, res);
  }
  @Put('update_mcq')
  async updateFlashCard(
    @Body() body: { flashcardId: cardIdDTO; cardBody: cardBody },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { flashcardId, cardBody } = body;
    const { details, qaPair } = cardBody;
    return await this.mcqservice.updateFlashCard(
      flashcardId,
      details,
      qaPair,
      req,
      res,
    );
  }
  @Delete('delete_mcq/:mcqId')
  async deleteFlashCard(
    @Param('mcqId') mcqId: cardIdDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.mcqservice.deleteFlashCard(mcqId, req, res);
  }
}
