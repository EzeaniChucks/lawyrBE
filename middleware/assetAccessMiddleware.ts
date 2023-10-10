import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request, Response, NextFunction } from 'express';
import { Model } from 'mongoose';
import { jwtIsValid } from 'src/utils';

@Injectable()
export class PaymentsChecker implements NestMiddleware {
  constructor(@InjectModel('contents') private readonly contents: Model<any>) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.signedCookies.accessToken) {
        return res.status(400).json('Forbidden request');
      }
      const isTokenValid = await jwtIsValid(req.signedCookies.accessToken);
      if (isTokenValid) {
        next();
      } else {
        return res.status(400).json({
          msg: 'Forbidden request. Token is expired or tampered with',
        });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  }
}
