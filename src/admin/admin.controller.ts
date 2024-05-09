import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import {
  AddSubAdminAccessDTO,
  RemoveSubAdminAccessDTO,
  TurnSubAdminToUserDTO,
  TurnUserToSubAdminDTO,
} from './admin.dto';

@Controller('admin')
// @ApiTags('Admin')
export class AdminController {
  constructor(private readonly adminservice: AdminService) {}

  @Get('fetch_particular_resource/:resource_name')
  @ApiTags('Admin')
  async fetchParticularResource(
    @Param('resource_name') resource_name: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.adminservice.fetchParticularResource(
      resource_name,
      req,
      res,
    );
  }

  @Get('fetch_all_users/:purpose')
  @ApiTags('Admin')
  async fetchAllUsers(
    @Param('purpose') purpose: 'for_admin_settings',
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.adminservice.fetchAllUsers(purpose, res);
  }

  @Get('fetch_all_subadmins/:purpose')
  @ApiTags('Admin')
  async fetchAllSubAdmins(
    @Req() req: Request,
    @Res() res: Response,
    @Param('purpose') purpose?: 'for_admin_settings',
  ) {
    return await this.adminservice.fetchAllSubAdmins(purpose, res);
  }

  @Put('turn_user_to_subadmin')
  @ApiTags('Admin')
  async turnUserToSubAdmin(
    @Body() body: TurnUserToSubAdminDTO,
    @Res() res: Response,
  ) {
    return this.adminservice.turnUserToSubAdmin(body?.userId, res);
  }

  @Put('turn_subadmin_to_user')
  @ApiTags('Admin')
  async turnSubAdminToUser(
    @Body() body: TurnSubAdminToUserDTO,
    @Res() res: Response,
  ) {
    return this.adminservice.turnSubAdminToUser(body?.userId, res);
  }

  @Put('add_subadmin_access')
  @ApiTags('Admin')
  async addSubAdminAccess(
    @Body() body: AddSubAdminAccessDTO,
    @Res() res: Response,
  ) {
    const { subAdminId, accessName } = body;
    return this.adminservice.addSubAdminAccess(subAdminId, accessName, res);
  }

  @Put('remove_subadmin_access')
  @ApiTags('Admin')
  async removeSubAdminAccess(
    @Body() body: RemoveSubAdminAccessDTO,
    @Res() res: Response,
  ) {
    const { subAdminId, accessName } = body;
    return this.adminservice.removeSubAdminAccess(subAdminId, accessName, res);
  }
}
