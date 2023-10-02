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

@Controller('admin')
export class AdminController {
  constructor(private readonly adminservice: AdminService) {}

  @Get('fetch_particular_resource/:resource_name')
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
  async fetchAllUsers(
    @Param('purpose') purpose: 'for_admin_settings',
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.adminservice.fetchAllUsers(purpose, res);
  }
  @Get('fetch_all_subadmins/:purpose')
  async fetchAllSubAdmins(
    @Param('purpose') purpose: 'for_admin_settings',
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.adminservice.fetchAllSubAdmins(purpose, res);
  }
  @Put('turn_user_to_subadmin')
  async turnUserToSubAdmin(
    @Body('userId') userId: string,
    @Res() res: Response,
  ) {
    return this.adminservice.turnUserToSubAdmin(userId, res);
  }
  @Put('turn_subadmin_to_user')
  async turnSubAdminToUser(
    @Body('userId') userId: string,
    @Res() res: Response,
  ) {
    return this.adminservice.turnSubAdminToUser(userId, res);
  }
  @Put('add_subadmin_access')
  async addSubAdminAccess(
    @Body() body: { subAdminId: string; accessName: string },
    @Res() res: Response,
  ) {
    const { subAdminId, accessName } = body;
    return this.adminservice.addSubAdminAccess(subAdminId, accessName, res);
  }
  @Put('remove_subadmin_access')
  async removeSubAdminAccess(
    @Body() body: { subAdminId: string; accessName: string },
    @Res() res: Response,
  ) {
    const { subAdminId, accessName } = body;
    return this.adminservice.removeSubAdminAccess(subAdminId, accessName, res);
  }
}
