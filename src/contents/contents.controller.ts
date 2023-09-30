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
} from '@nestjs/common';
import { ContentsService } from './contents.service';
import { Request, Response } from 'express';
import { Contents, FullContentsDetails } from './contents.dto';
import mongoose from 'mongoose';

@Controller('contents')
export class ContentsController {
  constructor(private readonly contentservice: ContentsService) {}
  @Get('generate_ids')
  async generateUserId() {
    let idsArray = [];
    for (let x = 0; x < 10; x++) {
      let id = new mongoose.mongo.ObjectId();
      idsArray.push(id);
    }
    return idsArray;
  }
  @Post('create_super_folder')
  async createcontent(
    @Body()
    body: Contents,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { name, type, resource, searchTags } = body;
    return this.contentservice.createcontent(
      { name, type, resource, searchTags },
      req,
      res,
    );
  }
  @Get('get_all_contents')
  async getAllContents() {
    return this.contentservice.getAllContents();
  }
  @Get('get_single_content/:superFolderId')
  async getSingleContents(@Param('superFolderId') superFolderId: string) {
    return this.contentservice.getSingleContent({ superFolderId });
  }
  @Put('update_single_content')
  async updateSuperFolder(
    @Body() superFolder: FullContentsDetails,
    @Res() res: Response,
  ) {
    return this.contentservice.updateSuperFolder(superFolder, res);
  }
  @Post('does_resource_exist')
  async doesResourceExist(
    @Body()
    body: { resourceId: string | undefined; resourceName: string },
    @Res() res: Response,
  ) {
    const { resourceId, resourceName } = body;
    return this.contentservice.doesResourceExist(resourceId, resourceName, res);
  }
  @Put('add_parent_ids_to_resource')
  async addParentIdsToResource(
    @Body()
    body: {
      resourceName: string;
      resourceId: string;
      parentIdsArray: string[];
    },
    @Res() res: Response,
    @Req() req: Request,
  ) {
    return this.contentservice.addParentIdsToResource({ ...body, req, res });
  }
  @Put('remove_parent_ids_from_resource')
  async removeParentIdsFromResource(
    @Body() body: { resourceName: string; resourceId: string },
    @Res() res: Response,
    @Req() req: Request,
  ) {
    return this.contentservice.removeParentIdsFromResource({
      ...body,
      req,
      res,
    });
  }
  @Put('monify_resource')
  async monifyResource(
    @Body()
    body: {
      resourceName: string;
      resourceId: string;
      settingsObj: {
        purchasePrice?: number;
        subscriptionPrice?: number;
        subscriptionDurationNo?: number;
        subscriptionDurationUnit?: string;
        isSubscription: boolean;
        isPurchase: boolean;
      };
    },
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const { resourceName, resourceId, settingsObj } = body;
    return this.contentservice.monifyResource({
      resourceName,
      resourceId,
      settingsObj,
      req,
      res,
    });
  }
}
