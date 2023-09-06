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
  async getAllMCQs(
    // @Param('mcqId') mcqId: cardIdDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
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
}
