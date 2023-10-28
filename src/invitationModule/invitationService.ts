import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { Model } from 'mongoose';

@Injectable()
export class InvitationService {
  constructor(
    @InjectModel('invitations') private invitations: Model<any>,
    @InjectModel('grouptests') private grouptests: Model<any>,
  ) {}

  //Helper Method
  async buildGroupinvitationArray({ memberArray, message, link }) {
    return memberArray.reduce((total: [any], item: any) => {
      const data = {
        recipientId: item?.userId,
        message,
        link,
      };
      total.push(data);
      return total;
    }, []);
  }

  async loginvitations(
    message: string,
    // userId: string,
    link: string,
    recipientsArray: { userId: string }[],
    // res: Response,
  ) {
    try {
      //blocking code below
      const array = await this.buildGroupinvitationArray({
        memberArray: recipientsArray,
        message,
        link,
        // userId,
      });
      //end of blocking code
      const invites = await this.invitations.create(array);
      if (!invites) {
        throw new BadRequestException({
          msg: 'Something went wrong logging invitation',
        });
      }
      return { msg: 'success', payload: 'invitation logged' };
    } catch (err) {
      return { msg: err?.message };
    }
  }
  async getinvitations(userId: string) {
    try {
      const invites = await this.invitations
        .find({ recipientId: userId })
        .select('recipientId has_checked message link createdAt');
      if (!invites) {
        throw new BadRequestException({ msg: 'Something went wrong' });
      }
      return { msg: 'success', payload: invites };
    } catch (err) {
      throw new InternalServerErrorException({ msg: err.message });
    }
  }
  async markAsChecked(messageId: string, userId: string) {
    try {
      const invite = await this.invitations.findOne({
        _id: messageId,
        recipientId: userId,
      });
      if (!invite) {
        throw new BadRequestException({ msg: 'Something went wrong' });
      }
      invite.has_checked = true;
      await invite.save();

      const invites = await this.invitations.find({ recipientId: userId });
      return { msg: 'success', payload: invites };
    } catch (err) {
      throw new InternalServerErrorException({ msg: err.message });
    }
  }
}
