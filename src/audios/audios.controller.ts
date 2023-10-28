import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { AudiosService } from './audios.service';
import { File } from 'buffer';
import { ApiTags } from '@nestjs/swagger';

@Controller('audios')
@ApiTags('Audio')
export class AudiosController {
  constructor(private readonly audioservice: AudiosService) {}
  @Post('upload_audio')
  @UseInterceptors(FileInterceptor('audioFile'))
  async uploadAudio(
    @UploadedFile() file: File,
    @Body()
    body: {
      name: string;
      parentId: string;
      audioActionType: string;
      title: string;
      description: string;
    },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!file) {
      return res.status(400).json('No file uploaded');
    }
    const { name, audioActionType, parentId, title, description } = body;
    return this.audioservice.uploadAudio(
      file,
      parentId,
      { title, description },
      name,
      audioActionType,
      req,
      res,
    );
  }
  @Get('get_all_audio_groups')
  async getAllAudioGroups() {
    return this.audioservice.getAllAudioGroups();
  }
  @Get('get_single_audio_group/:audioId')
  async getSingleAudioGroup(@Param('audioId') audioId: string) {
    return this.audioservice.getSingleAudioGroup(audioId);
  }
  @Put('replace_single_audio')
  @UseInterceptors(FileInterceptor('audioFile'))
  async ReplaceSingleAudio(
    @UploadedFile() file: File,
    @Body()
    body: {
      name: string;
      parentId: string;
      oldAudioId: string;
    },
    @Res() res: Response,
  ) {
    if (!file) {
      return res.status(400).json('No file uploaded');
    }
    const { name, parentId, oldAudioId } = body;
    return this.audioservice.replaceSingleAudio({
      audiofile: file,
      name,
      parentId,
      oldAudioId,
      res,
    });
  }
  @Put('edit_single_audio_name')
  async editSingleAudioName(
    @Body()
    body: {
      name: string;
      parentId: string;
      singleAudioId: string;
    },
    @Res() res: Response,
  ) {
    const { parentId, singleAudioId, name } = body;
    return this.audioservice.editSingleAudioName({
      name,
      parentId,
      singleAudioId,
      res,
    });
  }
  @Put('edit_audio_details')
  async editAudioDetails(
    @Body()
    body: {
      title: string;
      description: string;
      parentId: string;
    },
    @Res() res: Response,
  ) {
    const { parentId, title, description } = body;
    return this.audioservice.editAudioDetails({
      title,
      description,
      parentId,
      res,
    });
  }
  @Delete('delete_single_audio')
  async deleteSingleAudio(
    @Query()
    query: {
      parentId: string;
      audioId: string;
    },
    @Res() res: Response,
  ) {
    const { parentId, audioId } = query;
    return this.audioservice.deleteSingleAudio({
      parentId,
      audioId,
      res,
    });
  }
  @Delete('delete_entire_audio_group/:parentaudioId')
  async deleteEntireaudioGroup(
    @Param()
    param: {
      parentaudioId: string;
    },
    @Res() res: Response,
  ) {
    const { parentaudioId } = param;
    return this.audioservice.deleteEntireAudioGroups({
      parentaudioId,
      res,
    });
  }
}
