import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
// import { jwtIsValid } from 'src/util';
import * as jwt from 'jsonwebtoken';
import { jwtIsValid } from 'src/utils';

const requestArrays = ['/admin/fetch_all_users/for_admin_settings'];
@Injectable()
export class ForAdminContentManagement implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      //   const token = req?.signedCookies?.accessToken;
      const token = req?.headers?.authorization?.split(' ')[1];

      if (!token) {
        throw new ForbiddenException('Forbidden request');
      }

      const isTokenValid = await jwtIsValid(token);

      if (isTokenValid) {
        //check if user is admin
        if (!isTokenValid?.isAdmin && !isTokenValid?.isSubAdmin) {
          return res.status(400).json({
            msg: 'Forbidden request',
          });
        }
        if (isTokenValid?.isSubAdmin) {
          console.log(
            'request path',
            // req.url,
            req.originalUrl,
            // req.baseUrl,
            // req.path,
          );
        }
        req['decodedAdmin'] = isTokenValid;
        next();
      } else {
        return res.status(400).json({
          msg: 'Forbidden request',
        });
      }
    } catch (err) {
      throw new InternalServerErrorException({ msg: err.message });
    }
  }
}
