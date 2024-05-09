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
import { EssaysService } from './essays.service';
import {
  CreateEssayDTO,
  UpdateEssayDTO,
  essayBodyANDDetails,
  essayIdDTO,
} from './essays.dto';
import { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';

@Controller('essays')
@ApiTags('Essays')
export class EssaysController {
  constructor(private readonly essayservice: EssaysService) {}

  @Post('create_essay')
  async createMCQ(
    @Body() body: CreateEssayDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { details, essayBody } = body;
    return await this.essayservice.createEssay(details, essayBody, req, res);
  }

  @Get('get_essay/:essayId')
  async getEssay(
    @Param() param: essayIdDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { essayId } = param;
    return await this.essayservice.getEssay(essayId, res);
  }

  @Get('get_all_essays')
  async getAllEssays(@Req() req: Request, @Res() res: Response) {
    return await this.essayservice.getAllEssays(req, res);
  }

  @Put('update_essay')
  async updateEssay(
    @Body() body: UpdateEssayDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { essayId, essayBEObject } = body;
    const { details, essayBody } = essayBEObject;
    return await this.essayservice.updateEssay(
      essayId,
      details,
      essayBody,
      req,
      res,
    );
  }

  @Delete('delete_essay/:essayId')
  async deleteEssay(
    @Param('essayId') essayId: essayIdDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.essayservice.deleteEssay(essayId, req, res);
  }
}