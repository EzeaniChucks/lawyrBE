import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO, RegisterDTO } from './auth.dto';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authsevice: AuthService) {}
  @Get('is_logged_in')
  async isLoggedIn(@Res() res: Response, @Req() req: Request) {
    return await this.authsevice.isLoggedIn(req, res);
  }
  @Get('is_admin')
  async isAdmin(@Res() res: Response, @Req() req: Request) {
    return await this.authsevice.isAdmin(req, res);
  }
  @Get('full_user_details')
  async fullUserDetails(@Res() res: Response, @Req() req: Request) {
    return await this.authsevice.getFullUserDetails(req, res);
  }
  @Post('login')
  async login(@Body() body: LoginDTO, @Res() res: Response) {
    return await this.authsevice.login(body, res);
  }
  @Post('register')
  async register(@Body() body: RegisterDTO, @Res() res: Response) {
    return await this.authsevice.register(body, res);
  }
}
