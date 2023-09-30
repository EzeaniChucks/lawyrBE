import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request, Response } from 'express';
import { Model } from 'mongoose';
import { jwtIsValid } from 'src/utils';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel('mcqs') private readonly mcq: Model<any>,
    @InjectModel('docxpdf') private readonly pdf: Model<any>,
    @InjectModel('audios') private readonly audio: Model<any>,
    @InjectModel('videos') private readonly video: Model<any>,
    @InjectModel('essays') private readonly essay: Model<any>,
    @InjectModel('flashcards') private readonly flashcard: Model<any>,
  ) {}
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
  async fetchParticularResource(
    resourceName: string,
    req: Request,
    res: Response,
  ) {
    try {
      const decoded = await jwtIsValid(req?.signedCookies?.accessToken);
      if (decoded?.isAdmin === true) {
        let responseArray = undefined;
        if (resourceName === 'flashcard') {
          responseArray = await this.flashcard
            .find()
            .select('_id creatorId details.title');
        }
        if (resourceName === 'mcq') {
          responseArray = await this.mcq
            .find()
            .select('_id creatorId details.title');
        }
        if (resourceName === 'video') {
          responseArray = await this.video
            .find()
            .select('_id creatorId details.title');
        }
        if (resourceName === 'audio') {
          responseArray = await this.audio
            .find()
            .select('_id creatorId details.title');
        }
        if (resourceName === 'essay') {
          responseArray = await this.essay
            .find()
            .select('_id creatorId details.title');
        }
        if (resourceName === 'pdf') {
          responseArray = await this.pdf
            .find()
            .select('_id creatorId details.title');
        }
        return res.status(200).json({ payload: responseArray });
      } else {
        return res.status(400).json({ msg: 'Forbidden request' });
      }
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
}
