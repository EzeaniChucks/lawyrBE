import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { jwtIsValid } from 'src/utils';

@Injectable()
export class AdminService {
  //below method no longer useful
  // async isAdmin(req: Request, res: Response) {
  //   try {
  //     const decoded = await jwtIsValid(req?.signedCookies?.accessToken);
  //     if (decoded?.isAdmin === true) {
  //       return res.status(200).json(true);
  //     } else {
  //       return res.status(400).json(false);
  //     }
  //   } catch (err) {
  //     res.status(500).json(false);
  //   }
  // }
}
