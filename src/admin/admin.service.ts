import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request, Response } from 'express';
import { Model } from 'mongoose';
import { jwtIsValid } from 'src/utils';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel('accesses') private readonly accesses: Model<any>,
    @InjectModel('auths') private readonly auths: Model<any>,
    @InjectModel('mcqs') private readonly mcq: Model<any>,
    @InjectModel('docxpdfs') private readonly pdf: Model<any>,
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
  async fetchAllUsers(purpose: 'for_admin_settings', res: Response) {
    try {
      let list = [];
      if (purpose === 'for_admin_settings') {
        list = await this.auths
          .find({ isAdmin: false, isSubAdmin: false })
          .select('_id firstName lastName email');
      }
      return res.status(200).json({ msg: 'success', payload: list });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
  async fetchAllSubAdmins(purpose: 'for_admin_settings', res: Response) {
    try {
      let list = [];
      if (purpose === 'for_admin_settings') {
        list = await this.auths
          .find({ isAdmin: false, isSubAdmin: true })
          .select('_id firstName lastName');
      }
      return res.status(200).json({ msg: 'success', payload: list });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
  async turnUserToSubAdmin(userId: string, res: Response) {
    try {
      await this.auths.findOneAndUpdate(
        { _id: userId },
        { $set: { isSubAdmin: true } },
        { new: true },
      );
      return await this.fetchAllUsers('for_admin_settings', res);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
  async turnSubAdminToUser(subAdminId: string, res: Response) {
    try {
      await this.auths.findOneAndUpdate(
        { _id: subAdminId },
        { $set: { isSubAdmin: false } },
        { new: true },
      );
      return await this.fetchAllSubAdmins('for_admin_settings', res);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
  async addSubAdminAccess(
    subAdminId: string,
    accessName: string,
    res: Response,
  ) {
    try {
      const paths = [
        'can_penalize_users',
        'can_ban_users',
        'can_create_other_subadmins',
        'can_remove_other_subadmins',
        'can_create_admin_content',
        'can_edit_admin_content',
        'can_delete_admin_content',
      ];

      if (!paths.includes(accessName)) {
        return res.status(400).json({ msg: 'Bad request. AccessName invalid' });
      }
      const obj = {};
      obj[`access.subAdmin.${accessName}`] = subAdminId;
      const result = await this.accesses.findOneAndUpdate(
        { _id: '6519bada7a9fceeea2cd5cf2' },
        { $push: obj },
      );
      if (result) {
        return res
          .status(200)
          .json({ msg: 'success', payload: 'access successfully granted' });
      } else {
        return res.status(400).json({ msg: 'something went wrong' });
      }
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async removeSubAdminAccess(
    subAdminId: string,
    accessName: string,
    res: Response,
  ) {
    try {
      const paths = [
        'can_penalize_users',
        'can_ban_users',
        'can_create_other_subadmins',
        'can_remove_other_subadmins',
        'can_create_admin_content',
        'can_edit_admin_content',
        'can_delete_admin_content',
      ];
      if (!paths.includes(accessName)) {
        return res.status(400).json({ msg: 'Bad request. AccessName invalid' });
      }

      const obj = {};
      obj[`access.subAdmin.${accessName}`] = subAdminId;
      const result = await this.accesses.findOneAndUpdate(
        { _id: '6519bada7a9fceeea2cd5cf2' },
        { $pull: obj },
      );
      if (result) {
        return res
          .status(200)
          .json({ msg: 'success', payload: 'access successfully revoked' });
      } else {
        return res.status(400).json({ msg: 'something went wrong' });
      }
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
}