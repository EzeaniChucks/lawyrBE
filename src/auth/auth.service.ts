import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginDTO, RegisterDTO } from './auth.dto';
import { attachCookiesToResponse, jwtIsValid } from 'src/utils';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(@InjectModel('auth') private readonly user: Model<any>) {}
  async isLoggedIn(req: Request, res: Response) {
    try {
      const decoded = await jwtIsValid(req?.signedCookies?.accessToken);
      if (decoded) {
        return res.status(200).json(true);
      } else {
        return res.status(400).json(false);
      }
    } catch (err) {
      res.status(500).json(false);
    }
  }
  async isAdmin(req: Request, res: Response) {
    try {
      const decoded = await jwtIsValid(req?.signedCookies?.accessToken);
      if (decoded?.isAdmin === true) {
        return res.status(200).json(true);
      } else {
        return res.status(400).json(false);
      }
    } catch (err) {
      res.status(500).json(false);
    }
  }
  async getFullUserDetails(req: Request, res: Response) {
    try {
      const decoded = await jwtIsValid(req?.signedCookies?.accessToken);
      return res.status(200).json({ ...decoded, isAdmin: null });
    } catch (err) {
      return res.status(500).json(err?.message);
    }
  }
  async login(body: LoginDTO, res: Response) {
    const { email, password } = body;
    try {
      if (!email || !password) {
        throw new BadRequestException({ msg: 'Provide complete credentials' });
      }
      const user = await this.user.findOne({ email });
      if (!user) {
        return res.status(400).json({
          msg: 'Forbidden request. Incorrect credentials',
        });
      }
      const passIsValid = await bcrypt.compare(password, user?.password);
      if (passIsValid) {
        const {
          _id,
          email,
          firstName,
          lastName,
          phoneNumber,
          isVerified,
          isAdmin,
        } = user;

        await attachCookiesToResponse(res, {
          _id,
          firstName,
          lastName,
          phoneNumber,
          isAdmin,
        });

        return res.status(200).json({
          msg: 'Success',
          // user: { _id, email, firstName, lastName, phoneNumber },
        });
      } else {
        return res.status(400).json({ msg: 'wrong email or password' });
      }
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async register(body: RegisterDTO, res: Response) {
    const { email, password, firstName, lastName } = body;
    try {
      if (!email || !password || !firstName || !lastName) {
        throw new BadRequestException({
          msg: 'Provide the necessary credentials',
        });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(password, salt);
      const userExists = await this.user.findOne({ email });
      if (userExists) {
        return res.status(400).json({ msg: 'User email already exists' });
      }
      const user = await this.user.create({ ...body, password: hashedPass });
      const tokenUser = {
        _id: user?._id,
        firstName: user?.firstName,
        lastName: user?.lastName,
        phoneNumber: user?.phoneNumber || '',
        isAdmin: user?.isAdmin,
      };
      await attachCookiesToResponse(res, tokenUser);
      return res.status(200).json({ msg: 'Success' });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async signout(res:Response){
    try{
      res.cookie('accessToken', {}, {
        httpOnly: true,
        expires: new Date(Date.now()),
        secure: process.env.NODE_ENV === 'production',
        signed: true,
      });
      return res.status(200).json({msg:'logout successful'})
    } catch(err){
      return res.status(500).json({mag:err?.message})
    }
  }
}
