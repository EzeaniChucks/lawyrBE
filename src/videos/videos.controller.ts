import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
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
import { VideosService } from './videos.service';
import { Request, Response, query } from 'express';
import { File } from 'buffer';
import { ApiTags } from '@nestjs/swagger';

@Controller('videos')
@ApiTags('Videos')
export class VideosController {
  constructor(private readonly videoservice: VideosService) {}
  @Post('upload_video')
  @UseInterceptors(FileInterceptor('videoFile'))
  async uploadVideo(
    @UploadedFile() file: any,
    @Body()
    body: {
      name: string;
      parentId: string;
      videoActionType: string;
      title: string;
      description: string;
    },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!file) {
      return res.status(400).json('No file uploaded');
    }
    const { name, videoActionType, parentId, title, description } = body;
    // console.log(name, videoActionType, parentId, title, description);
    return this.videoservice.uploadVideo(
      file,
      parentId,
      { title, description },
      name,
      videoActionType,
      req,
      res,
    );
  }
  @Get('get_all_video_groups')
  async getAllVideos() {
    return this.videoservice.getAllVideoGroups();
  }

  @Get('get_single_video_group/:videoId')
  async getSingleVideo(@Param('videoId') videoId: string) {
    return this.videoservice.getSingleVideoGroup(videoId);
  }

  @Put('replace_single_video')
  @UseInterceptors(FileInterceptor('videoFile'))
  async ReplaceVideo(
    @UploadedFile() file: File,
    @Body()
    body: {
      name: string;
      parentId: string;
      oldVideoId: string;
    },
    @Res() res: Response,
  ) {
    if (!file) {
      return res.status(400).json('No file uploaded');
    }
    const { name, parentId, oldVideoId } = body;
    return this.videoservice.replaceSingleVideo({
      videofile: file,
      name,
      parentId,
      oldVideoId,
      res,
    });
  }

  @Put('edit_single_video_name')
  async editSingleVideoName(
    @Body()
    body: {
      name: string;
      parentId: string;
      singleVideoId: string;
    },
    @Res() res: Response,
  ) {
    const { parentId, singleVideoId, name } = body;
    return this.videoservice.editSingleVideoName({
      name,
      parentId,
      singleVideoId,
      res,
    });
  }

  @Put('edit_video_details')
  async editVideoDetails(
    @Body()
    body: {
      title: string;
      description: string;
      parentId: string;
    },
    @Res() res: Response,
  ) {
    const { parentId, title, description } = body;
    return this.videoservice.editVideoDetails({
      title,
      description,
      parentId,
      res,
    });
  }
  @Delete('delete_single_video')
  async deleteSingleVideo(
    @Query()
    query: {
      parentId: string;
      videoId: string;
    },
    @Res() res: Response,
  ) {
    const { parentId, videoId } = query;
    return this.videoservice.deleteSingleVideo({
      parentId,
      videoId,
      res,
    });
  }

  @Delete('delete_entire_video_group/:parentVideoId')
  async deleteEntireVideoGroup(
    @Param()
    param: {
      parentVideoId: string;
    },
    @Res() res: Response,
  ) {
    const { parentVideoId } = param;
    return this.videoservice.deleteEntireVideoGroup({
      parentVideoId,
      res,
    });
  }
}
