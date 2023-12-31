import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { Model } from 'mongoose';

@Injectable()
export class NotifService {
  constructor(
    @InjectModel('notifications') private notifications: Model<any>,
    @InjectModel('grouptests') private grouptests: Model<any>,
  ) {}

  //Helper Method
  async buildGroupNotificationArray({
    memberArray,
    message,
    link,
    // userId,
    reason,
  }) {
    return memberArray.reduce((total: [any], item: any) => {
      // if (item?.toString() === userId) return total; //prevents sending notif to notif logger
      const data = {
        recipientId: item?.userId,
        message,
        link,
        reason,
      };
      total.push(data);
      return total;
    }, []);
  }

  async logNotifications(
    message: string,
    // userId: string,
    link: string,
    reason: string,
    recipientsArray: { userId: string }[],
    // res: Response,
  ) {
    try {
      //blocking code below
      const array = await this.buildGroupNotificationArray({
        memberArray: recipientsArray,
        message,
        link,
        // userId,
        reason,
      });
      //end of blocking code
      const notifs = await this.notifications.create(array);
      if (!notifs) {
        throw new BadRequestException({
          msg: 'Something went wrong logging notification',
        });
      }
      return { msg: 'success', payload: 'Notification logged' };
    } catch (err) {
      return { msg: err?.message };
    }
  }
  async getNotifications(userId: string) {
    try {
      const notifs = await this.notifications.find({ recipientId: userId });
      if (!notifs) {
        throw new BadRequestException({ msg: 'Something went wrong' });
      }
      return { msg: 'success', payload: notifs };
    } catch (err) {
      throw new InternalServerErrorException({ msg: err.message });
    }
  }
  async markAsChecked(messageId: string, userId: string) {
    try {
      const notif = await this.notifications.findOne({
        _id: messageId,
        recipientId: userId,
      });
      if (!notif) {
        throw new BadRequestException({ msg: 'Something went wrong' });
      }
      notif.has_checked = true;
      await notif.save();

      const notifs = await this.notifications.find({ recipientId: userId });
      return { msg: 'success', payload: notifs };
    } catch (err) {
      throw new InternalServerErrorException({ msg: err.message });
    }
  }
}
