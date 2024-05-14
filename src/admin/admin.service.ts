import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
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
  //     const decoded = await jwtIsValid(req?.headers?.authorization?.split(' ')[1]);
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
      const decoded = await jwtIsValid(
        req?.headers?.authorization?.split(' ')[1],
      );
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
          .select('_id firstName lastName email');

        const finalList = [];
        // Loop through each user
        for (const user of list) {
          // Retrieve the _id of the user
          const userId = user._id;

          // Query the access collection
          const access = await this.accesses.findOne({
            $or: [
              { 'access.subAdmin.can_penalize_users': userId },
              { 'access.subAdmin.can_ban_users': userId },
              { 'access.subAdmin.can_create_other_subadmins': userId },
              { 'access.subAdmin.can_remove_other_subadmins': userId },
              { 'access.subAdmin.can_create_admin_content': userId },
              { 'access.subAdmin.can_edit_admin_content': userId },
              { 'access.subAdmin.can_delete_admin_content': userId },
              { 'access.subAdmin.can_monify_admin_content': userId },
              { 'access.subAdmin.can_unmonify_admin_content': userId },
            ],
          });

          // Initialize an array to store access names
          const accessNames = [];

          // If access is found, extract the object keys where userId is present
          if (access) {
            // console.log(true, user?.firstName);
            const subAdmin = access.access.subAdmin;
            for (const key in subAdmin) {
              if (subAdmin[key]?.toString()?.includes(userId)) {
                accessNames.push(key);
              }
            }
          }
          // Add the accessNames to the user object
          finalList.push({ ...user._doc, subAdminAccesses:accessNames });
        }

        // Now users array contains a new field 'accessesNames' for each user
        // console.log(finalList);
        return res.status(200).json({ msg: 'success', payload: finalList });
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
        { _id: process.env.ACCESS_DOC_ID },
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
        { _id: process.env.ACCESS_DOC_ID },
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

  public async checkSubAdminAccessEligibility(
    subAdminId: string,
    accessName: string,
  ): Promise<{ msg: string; payload: boolean }> {
    try {
      const paths = [
        'can_penalize_users',
        'can_ban_users',
        'can_create_other_subadmins',
        'can_remove_other_subadmins',
        'can_create_admin_content',
        'can_edit_admin_content',
        'can_delete_admin_content',
        'can_monify_admin_content',
        'can_unmonify_admin_content',
      ];
      if (!paths.includes(accessName)) {
        return { msg: 'unavailable access name', payload: false };
      }
      const readableFeatureFormat = {
        can_penalize_users: 'penalize users',
        can_ban_users: 'ban users',
        can_create_other_subadmins: 'create other subadmins',
        can_remove_other_subadmins:
          'strip other subadmins ot their subadmin status',
        can_create_admin_content: 'create admin contents',
        can_edit_admin_content: 'edit or update admin contents',
        can_delete_admin_content: 'delete admin contents',
        can_monify_admin_content: 'monify admin contents',
        can_unmonify_admin_content: 'unmonify admin contents',
      };

      const obj = {};
      const ObjectId = new mongoose.Types.ObjectId(subAdminId);

      // obj[`access.subAdmin.${accessName}`] = ObjectId;
      obj[`access.subAdmin.${accessName}`] = subAdminId;
      obj[`_id`] = process.env.ACCESS_DOC_ID;
      const result = await this.accesses.findOne(obj);

      // console.log(
      //   'object for accesses editing',
      //   obj,
      //   result,
      // );
      if (result) {
        return { msg: 'success', payload: true };
      } else {
        let featureType;
        return {
          msg: `access denied. Ask admin to give you the permission to ${[readableFeatureFormat[accessName]]}`,
          payload: false,
        };
      }
    } catch (err: any) {
      return { msg: err.message, payload: false };
    }
  }
}
