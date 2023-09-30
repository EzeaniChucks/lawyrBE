import { Controller, Get, Param, Req, Res } from '@nestjs/common';
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
}
