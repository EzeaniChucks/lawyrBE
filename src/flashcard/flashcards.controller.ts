import {
  Controller,
  Req,
  Res,
  Body,
  Param,
  Post,
  Get,
  Delete,
  Put,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { FlashCardsService } from './flashcards.service';
import { cardBody, cardIdDTO } from './flashcards.dto';

@Controller('flashcards')
export class FlashCardController {
  constructor(private readonly flashservice: FlashCardsService) {}
  @Post('create_flashcard')
  async createFlashCard(
    @Body() body: cardBody,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { details, qaPair } = body;
    return await this.flashservice.createFlashCard(details, qaPair, req, res);
  }
  @Get('get_flashcard/:flashcardId')
  async getFlashCard(
    @Param('flashcardId') flashcardId: cardIdDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.flashservice.getFlashCard(flashcardId, res);
  }
  @Get('get_all_flashcards')
  async getAllFlashCards(
    // @Param('flashcardId') flashcardId: cardIdDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.flashservice.getAllFlashCards(req, res);
  }
  @Put('update_flashcard')
  async updateFlashCard(
    @Body() body: { flashcardId: cardIdDTO; cardBody: cardBody },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { flashcardId, cardBody } = body;
    const { details, qaPair } = cardBody;
    return await this.flashservice.updateFlashCard(
      flashcardId,
      details,
      qaPair,
      req,
      res,
    );
  }
  @Delete('delete_flashcard/:flashcardId')
  async deleteFlashCard(
    @Param('flashcardId') flashCardId: cardIdDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.flashservice.deleteFlashCard(flashCardId, req, res);
  }
}
