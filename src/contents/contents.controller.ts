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
import {
  AddItemToUserAssetDTO,
  AddParentIDsToResourceDTO,
  CanResourceBeDeletedDTO,
  CanUserAccessResourceDTO,
  Contents,
  DoesResourceExistSomewhereElseDTO,
  FullContentsDetails,
  MonifyResourceDTO,
  RemoveParentIDsFromResourceDTO,
  UnMonifyResourceDTO,
  adduserIdsToResourcePaymentArraysDTO,
  isUserSubActiveDTO,
  removeItemsFromUserAssetDTO,
} from './contents.dto';
import mongoose from 'mongoose';
import { ApiTags } from '@nestjs/swagger';

@Controller('contents')
@ApiTags('Contents')
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
    @Req() req: Request,
  ) {
    return this.contentservice.updateSuperFolder(superFolder, req, res);
  }

  @Delete('delete_super_content/:superFolderId')
  async deleteSuperFolder(
    @Param('superFolderId') superFolderId: FullContentsDetails['_id'],
    @Res() res: Response,
    @Req() req: Request,
  ) {
    return this.contentservice.deleteSuperFolder(superFolderId, req, res);
  }

  @Put('add_item_to_user_assets')
  async addItemToUserAssets(
    @Body()
    body: AddItemToUserAssetDTO,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const { userId, item, destination } = body;
    return this.contentservice.addItemToUserAssets(
      userId,
      item,
      destination,
      res,
    );
  }

  @Put('remove_item_from_user_assets')
  async removeItemFromUserAssets(
    @Body()
    body: removeItemsFromUserAssetDTO,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const { userId, item, destination } = body;
    return this.contentservice.removeItemFromUserAssets(
      userId,
      item,
      destination,
      res,
    );
  }

  @Put('update_payment_on_single_content')
  async updateUserSubORPurchaseOnSuperFolder(
    @Body() superFolder: FullContentsDetails,
    @Res() res: Response,
  ) {
    return this.contentservice.updateUserSubORPurchaseOnSuperFolder(
      superFolder,
      res,
    );
  }

  @Post('does_resource_exist')
  async doesResourceExistSomewhereElse(
    @Body()
    body: DoesResourceExistSomewhereElseDTO,
    @Res() res: Response,
  ) {
    const { resourceId, resourceName } = body;
    return this.contentservice.doesResourceExistSomewhereElse(
      resourceId,
      resourceName,
      res,
    );
  }

  @Post('can_resource_be_deleted')
  async canResourceBeDeleted(
    @Body()
    body: CanResourceBeDeletedDTO,
    @Res() res: Response,
  ) {
    const { resourceId, resourceName } = body;
    return this.contentservice.canResourceBeDeleted(
      resourceId,
      resourceName,
      res,
    );
  }

  @Post('can_folder_be_deleted')
  async canFolderBeDeleted(
    @Body()
    body: { folder: FullContentsDetails; resourceName: string },
    @Res() res: Response,
  ) {
    const { folder, resourceName } = body;
    return this.contentservice.canFolderBeDeleted(resourceName, folder, res);
  }

  @Post('can_super_folder_be_deleted')
  async canSuperFolderBeDeleted(
    @Body()
    body: { folderId: FullContentsDetails['_id']; resourceName: string },
    @Res() res: Response,
  ) {
    const { folderId, resourceName } = body;
    return this.contentservice.canSuperFolderBeDeleted({
      resourceName,
      folderId,
      res,
    });
  }

  @Post('can_user_access_resource')
  async canUserAccessResource(
    @Body()
    body: CanUserAccessResourceDTO,
    @Res() res: Response,
  ) {
    const { resourceId, resourceName, userId } = body;
    return this.contentservice.canUserAccessResource(
      resourceId,
      resourceName,
      userId,
      res,
    );
  }
  @Post('is_user_sub_active')
  async isUserSubActive(
    @Body()
    body: isUserSubActiveDTO,
    @Res() res: Response,
  ) {
    const { resourceId, resourceName, userId, contentId } = body;
    return this.contentservice.isUserSubActive(
      contentId,
      userId,
      resourceName,
      resourceId,
      res,
    );
  }

  @Put('add_parent_ids_to_resource')
  async addParentIdsToResource(
    @Body()
    body: AddParentIDsToResourceDTO,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    return this.contentservice.addParentIdsToResource({ ...body, req, res });
  }

  @Put('remove_parent_ids_from_resource')
  async removeParentIdsFromResource(
    @Body() body: RemoveParentIDsFromResourceDTO,
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
    body: MonifyResourceDTO,
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

  @Put('add_userIds_to_resource_payment_arrays')
  async adduserIdsToResourcePaymentArrays(
    @Body()
    body: adduserIdsToResourcePaymentArraysDTO,
    @Res() res: Response,
  ) {
    const { resourceName, resourceId, settingsObj } = body;
    return this.contentservice.adduserIdsToResourcePaymentArrays({
      resourceName,
      resourceId,
      settingsObj,
      res,
    });
  }

  @Put('unmonify_resource')
  async umonifyResource(
    @Body() body: UnMonifyResourceDTO,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    return this.contentservice.unmonifyResource({
      ...body,
      req,
      res,
    });
  }
}
