import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.services';
import { ChildProcess, fork } from 'child_process';
import { Request, Response } from 'express';
import { attachCookiesToResponse, jwtIsValid } from 'src/utils';
import { Contents, FullContentsDetails } from './contents.dto';

@Injectable()
export class ContentsService {
  constructor(
    @InjectModel('contents') private readonly content: Model<any>,
    @InjectModel('auths') private readonly auth: Model<any>,
    @InjectModel('mcqs') private readonly mcq: Model<any>,
    @InjectModel('docxpdfs') private readonly pdf: Model<any>,
    @InjectModel('audios') private readonly audio: Model<any>,
    @InjectModel('videos') private readonly video: Model<any>,
    @InjectModel('essays') private readonly essay: Model<any>,
    @InjectModel('flashcards') private readonly flashcard: Model<any>,
    private readonly cloudinaryservice: CloudinaryService,
  ) {}
  // private childProcess: ChildProcess;
  generateSecurecontentURl(contentPublicId: string) {
    const options = {
      resource_type: 'content',
      type: 'authenticated',
      secure: true,
      // expiration_time
    };
    return this.cloudinaryservice.url(contentPublicId, options);
  }
  async createcontent(contentfile: Contents, req: Request, res: Response) {
    const { name, resource, type, searchTags } = contentfile;
    try {
      const cookieObj = await jwtIsValid(req?.signedCookies?.accessToken);
      const creatorId = cookieObj._id;
      if (cookieObj?.isAdmin !== true) {
        return res.status(400).json({ msg: 'Forbidden request' });
      }
      if (
        !name ||
        resource !== 'folder' ||
        type !== 'folder' ||
        searchTags.length == 0
      ) {
        return res
          .status(400)
          .json({ msg: 'Bad Request. Send correct parameters' });
      }

      const content = await this.content.create({ ...contentfile, creatorId });
      const { _id } = content;
      return res.status(200).json({
        msg: 'success',
        payload: { _id, type, name, resource, searchTags },
      });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async getAllContents() {
    try {
      const allcontents = await this.content
        .find()
        .select('_id creatorId type name resource searchTags');
      return { payload: allcontents };
    } catch (err) {
      throw new InternalServerErrorException({ msg: err?.message });
    }
  }
  async getSingleContent({ superFolderId }: { superFolderId: string }) {
    try {
      const singlecontent = await this.content.findOne({ _id: superFolderId });
      return { payload: singlecontent };
    } catch (err) {
      throw new InternalServerErrorException({ msg: err?.message });
    }
  }

  //adds a resource or folder to the user cart, purchases or subscriptions records
  async addItemToUserAssets(
    userId: string,
    item: {
      resourceName: string;
      resourceType: string;
      resourceId: string;
      resourceParentIds: string;
    },
    destination: 'subscriptions array' | 'purchases array' | 'cart array',
    res: Response,
  ) {
    try {
      //check if item is already in cart
      let checkusercart = await this.auth.findOne({
        _id: userId,
        'assets.cart': { $elemMatch: { resourceId: item.resourceId } },
      });

      if (checkusercart) {
        return res.status(400).json({
          msg: 'unsuccesful',
          payload: 'item is already in your cart',
        });
      }

      const user = await this.auth.findOne({ _id: userId });
      if (destination === 'subscriptions array') {
        user.assets.subscriptions.push(item);
      }
      if (destination === 'purchases array') {
        user.assets.purchases.push(item);
      }
      if (destination === 'cart array') {
        user.assets.cart.push(item);
      }
      user.save();
      const { _id, firstName, lastName, isAdmin, assets, phoneNumber } = user;
      await attachCookiesToResponse(res, {
        _id,
        firstName,
        lastName,
        isAdmin,
        assets,
        phoneNumber,
      });
      return res
        .status(200)
        .json({ msg: 'success', payload: 'item successfully added to cart' });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }

  //removes a resource or folder to the user cart, purchases or subscriptions records
  async removeItemFromUserAssets(
    userId: string,
    item: {
      resourceName: string;
      resourceType: string;
      resourceId: string;
      resourceParentIds: string;
    },
    destination: 'subscriptions array' | 'purchases array' | 'cart array',
    res: Response,
  ) {
    try {
      //check if item is already in cart
      let checkusercart = await this.auth.findOne({
        _id: userId,
        'assets.cart': { $elemMatch: { resourceId: item.resourceId } },
      });

      if (checkusercart) {
        return res.status(400).json({
          msg: 'unsuccesful',
          payload: 'item is already in your cart',
        });
      }

      let user;
      if (destination === 'subscriptions array') {
        await this.auth.findOneAndUpdate(
          { _id: userId },
          {
            $pull: {
              'assets.subscriptions': {
                resourceId: item?.resourceId,
              },
            },
          },
          { new: true },
        );
      }
      if (destination === 'purchases array') {
        await this.auth.findOneAndUpdate(
          { _id: userId },
          { $pull: { 'assets.purchases': { resourceId: item?.resourceId } } },
          { new: true },
        );
      }
      if (destination === 'cart array') {
        await this.auth.findOneAndUpdate(
          { _id: userId },
          { $pull: { 'assets.cart': { resourceId: item?.resourceId } } },
          { new: true },
        );
      }
      const { _id, firstName, lastName, isAdmin, assets, phoneNumber } = user;
      await attachCookiesToResponse(res, {
        _id,
        firstName,
        lastName,
        isAdmin,
        assets,
        phoneNumber,
      });
      return res
        .status(200)
        .json({ msg: 'success', payload: 'item successfully added to cart' });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }

  async updateSuperFolder(
    newSuperFolder: FullContentsDetails,
    req: Request,
    res: Response,
  ) {
    try {
      const decoded = await jwtIsValid(req?.signedCookies?.accessToken);
      if (!decoded?.isAdmin) {
        return res.status(400).json({ msg: 'Forbidden request' });
      }
      const singlecontent = await this.content.findOneAndUpdate(
        { _id: newSuperFolder._id },
        { $set: newSuperFolder },
        { new: true },
      );
      return res.status(200).json({ payload: singlecontent });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }

  async updateUserSubORPurchaseOnSuperFolder(
    newSuperFolder: FullContentsDetails,
    res: Response,
  ) {
    try {
      const singlecontent = await this.content.findOneAndUpdate(
        { _id: newSuperFolder._id },
        { $set: newSuperFolder },
        { new: true },
      );
      return res.status(200).json({ payload: singlecontent });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }

  async doesResourceExistSomewhereElse(
    resourceId: string | undefined,
    resourceName: string,
    res: Response,
  ) {
    try {
      if (resourceName !== 'folder') {
        let alreadyexists = null;
        let superFolderName = '';
        if (resourceName === 'flashcard') {
          let result = await this.flashcard.findOne({ _id: resourceId });
          if (result.parentIds.length !== 0) {
            const superFolder = await this.content.findOne({
              _id: result.parentIds[0],
            });
            superFolderName = superFolder?.name;
            alreadyexists = true;
          }
        }
        if (resourceName === 'mcq') {
          let result = await this.mcq.findOne({ _id: resourceId });
          if (result.parentIds.length !== 0) {
            const superFolder = await this.content.findOne({
              _id: result.parentIds[0],
            });
            superFolderName = superFolder?.name;
            alreadyexists = true;
          }
        }
        if (resourceName === 'video') {
          let result = await this.video.findOne({ _id: resourceId });
          if (result.parentIds.length !== 0) {
            const superFolder = await this.content.findOne({
              _id: result.parentIds[0],
            });
            superFolderName = superFolder?.name;
            alreadyexists = true;
          }
        }
        if (resourceName === 'audio') {
          let result = await this.audio.findOne({ _id: resourceId });
          if (result.parentIds.length !== 0) {
            const superFolder = await this.content.findOne({
              _id: result.parentIds[0],
            });
            superFolderName = superFolder?.name;
            alreadyexists = true;
          }
        }
        if (resourceName === 'essay') {
          let result = await this.essay.findOne({ _id: resourceId });
          if (result.parentIds.length !== 0) {
            const superFolder = await this.content.findOne({
              _id: result.parentIds[0],
            });
            superFolderName = superFolder?.name;
            alreadyexists = true;
          }
        }
        if (resourceName === 'pdf') {
          let result = await this.pdf.findOne({ _id: resourceId });
          if (result.parentIds.length !== 0) {
            const superFolder = await this.content.findOne({
              _id: result.parentIds[0],
            });
            superFolderName = superFolder?.name;
            alreadyexists = true;
          }
        }
        if (alreadyexists) {
          return res.status(400).json({
            msg: `Resource already exists in superFolder '${superFolderName}'. Delete in existing location first`,
          });
        } else {
          return res
            .status(200)
            .json({ payload: 'success', msg: 'content approved for addition' });
        }
      } else {
        return res
          .status(400)
          .json({ msg: 'Bad request. File name cannot be folder' });
      }
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
  async canResourceBeDeleted(
    resourceId: string | undefined,
    resourceName: string,
    res: Response,
  ) {
    try {
      if (resourceName !== 'folder') {
        let can_resource_be_deleted = true;
        let amount_of_subscribers = 0;
        let amount_of_purchasers = 0;
        if (resourceName === 'flashcard') {
          let result = await this.flashcard.findOne({ _id: resourceId });
          if (
            result?.subscribedUsersIds?.length !== 0 ||
            result?.paidUsersIds?.length !== 0
          ) {
            amount_of_subscribers = result?.subscribedUsersIds?.length;
            amount_of_purchasers = result?.paidUsersIds?.length;
            can_resource_be_deleted = false;
          }
        }
        if (resourceName === 'mcq') {
          let result = await this.mcq.findOne({ _id: resourceId });
          if (
            result?.subscribedUsersIds?.length !== 0 ||
            result?.paidUsersIds?.length !== 0
          ) {
            amount_of_subscribers = result?.subscribedUsersIds?.length;
            amount_of_purchasers = result?.paidUsersIds?.length;
            can_resource_be_deleted = false;
          }
        }
        if (resourceName === 'video') {
          let result = await this.video.findOne({ _id: resourceId });
          if (
            result?.subscribedUsersIds?.length !== 0 ||
            result?.paidUsersIds?.length !== 0
          ) {
            amount_of_subscribers = result?.subscribedUsersIds?.length;
            amount_of_purchasers = result?.paidUsersIds?.length;
            can_resource_be_deleted = false;
          }
        }
        if (resourceName === 'audio') {
          let result = await this.audio.findOne({ _id: resourceId });
          if (
            result?.subscribedUsersIds?.length !== 0 ||
            result?.paidUsersIds?.length !== 0
          ) {
            amount_of_subscribers = result?.subscribedUsersIds?.length;
            amount_of_purchasers = result?.paidUsersIds?.length;
            can_resource_be_deleted = false;
          }
        }
        if (resourceName === 'essay') {
          let result = await this.essay.findOne({ _id: resourceId });
          if (
            result?.subscribedUsersIds?.length !== 0 ||
            result?.paidUsersIds?.length !== 0
          ) {
            amount_of_subscribers = result?.subscribedUsersIds?.length;
            amount_of_purchasers = result?.paidUsersIds?.length;
            can_resource_be_deleted = false;
          }
        }
        if (resourceName === 'pdf') {
          let result = await this.pdf.findOne({ _id: resourceId });
          if (
            result?.subscribedUsersIds?.length !== 0 ||
            result?.paidUsersIds?.length !== 0
          ) {
            amount_of_subscribers = result?.subscribedUsersIds?.length;
            amount_of_purchasers = result?.paidUsersIds?.length;
            can_resource_be_deleted = false;
          }
        }
        if (!can_resource_be_deleted) {
          return res.status(400).json({
            msg: `Resource has ${amount_of_subscribers} subscribers and ${amount_of_purchasers} paid users. subcription and paid users list must be empty for deletion to happen.`,
          });
        } else {
          return res
            .status(200)
            .json({ payload: 'success', msg: 'content approved for deletion' });
        }
      } else {
        return res
          .status(400)
          .json({ msg: "Bad request. File name cannot be 'folder'" });
      }
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
  async canFolderBeDeleted(
    resourceName: string,
    folder: FullContentsDetails,
    res: Response,
  ) {
    try {
      if (resourceName === 'folder') {
        let can_folder_be_deleted = true;
        const queue: FullContentsDetails[] = [folder];

        while (queue.length) {
          let len = queue.length;
          queue.map((eachCont) => {
            if (
              eachCont?.subscribedUsersIds.length > 0 ||
              eachCont?.paidUsersIds?.length > 0
            ) {
              can_folder_be_deleted = false;
            }
            return eachCont;
          });

          while (len--) {
            let node = queue.shift();
            if (node) {
              for (let child of node.children) {
                queue.push(child);
              }
            }
          }
        }
        if (!can_folder_be_deleted) {
          return res.status(200).json({
            msg: `sucesss`,
            payload: false,
          });
        } else {
          return res.status(200).json({ mag: 'success', payload: true });
        }
      } else {
        return res
          .status(400)
          .json({ msg: 'Bad request. Type of input is not folder' });
      }
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
  async canUserAccessResource(
    resourceId: string | undefined,
    resourceName: string,
    userId: string,
    res: Response,
  ) {
    try {
      if (resourceName !== 'folder') {
        let can_user_access_resource = false;

        //helper function
        const returnAccessSub = (result: any) => {
          let access = false;
          result?.subscribedUsersIds?.map((eachSub: { userId: string }) => {
            if (eachSub?.userId?.toString() === userId?.toString()) {
              access = true;
            }
          });
          return access;
        };

        //helper function
        const returnAccessPurchase = (result: any) => {
          let access = false;
          result?.paidUsersIds?.map((eachPurchase: { userId: string }) => {
            if (eachPurchase.userId.toString() === userId.toString()) {
              access = true;
            }
          });
          return access;
        };

        if (resourceName === 'flashcard') {
          let result = await this.flashcard.findOne({ _id: resourceId });
          if (!result?.isSubscription && !result?.isPurchase) {
            can_user_access_resource = true;
          } else if (result?.isSubscription) {
            can_user_access_resource = returnAccessSub(result);
          } else if (result?.isPurchase) {
            can_user_access_resource = returnAccessPurchase(result);
          }
        }
        if (resourceName === 'mcq') {
          let result = await this.mcq.findOne({ _id: resourceId });
          if (!result?.isSubscription && !result?.isPurchase) {
            can_user_access_resource = true;
          } else if (result?.isSubscription) {
            can_user_access_resource = returnAccessSub(result);
          } else if (result?.isPurchase) {
            can_user_access_resource = returnAccessPurchase(result);
          }
        }
        if (resourceName === 'video') {
          let result = await this.video.findOne({ _id: resourceId });
          if (!result?.isSubscription && !result?.isPurchase) {
            can_user_access_resource = true;
          } else if (result?.isSubscription) {
            can_user_access_resource = returnAccessSub(result);
          } else if (result?.isPurchase) {
            can_user_access_resource = returnAccessPurchase(result);
          }
        }
        if (resourceName === 'audio') {
          let result = await this.audio.findOne({ _id: resourceId });
          if (!result?.isSubscription && !result?.isPurchase) {
            can_user_access_resource = true;
          } else if (result?.isSubscription) {
            can_user_access_resource = returnAccessSub(result);
          } else if (result?.isPurchase) {
            can_user_access_resource = returnAccessPurchase(result);
          }
        }
        if (resourceName === 'essay') {
          let result = await this.essay.findOne({ _id: resourceId });
          if (!result?.isSubscription && !result?.isPurchase) {
            can_user_access_resource = true;
          } else if (result?.isSubscription) {
            can_user_access_resource = returnAccessSub(result);
          } else if (result?.isPurchase) {
            can_user_access_resource = returnAccessPurchase(result);
          }
        }
        if (resourceName === 'pdf') {
          let result = await this.pdf.findOne({ _id: resourceId });
          if (!result?.isSubscription && !result?.isPurchase) {
            can_user_access_resource = true;
          } else if (result?.isSubscription) {
            can_user_access_resource = returnAccessSub(result);
          } else if (result?.isPurchase) {
            can_user_access_resource = returnAccessPurchase(result);
          }
        }
        if (!can_user_access_resource) {
          return res.status(200).json({
            msg: `permission denied`,
            payload: false,
          });
        } else {
          return res.status(200).json({ msg: 'success', payload: true });
        }
      } else {
        return res
          .status(400)
          .json({ msg: "Bad request. File name cannot be 'folder'" });
      }
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
  //endpoint called after adding a new file to a folder. Useful for locating the file within the folder in the future
  async addParentIdsToResource({
    resourceName,
    resourceId,
    parentIdsArray,
    req,
    res,
  }: {
    resourceName: string;
    resourceId: string;
    parentIdsArray: string[];
    req: Request;
    res: Response;
  }) {
    try {
      const decoded = await jwtIsValid(req?.signedCookies?.accessToken);
      if (decoded?.isAdmin === true) {
        if (resourceName === 'flashcard') {
          await this.flashcard.findOneAndUpdate(
            { _id: resourceId },
            { $set: { parentIds: parentIdsArray } },
            { new: true },
          );
        }
        if (resourceName === 'mcq') {
          await this.mcq.findOneAndUpdate(
            { _id: resourceId },
            { $set: { parentIds: parentIdsArray } },
            { new: true },
          );
        }
        if (resourceName === 'video') {
          await this.video.findOneAndUpdate(
            { _id: resourceId },
            { $set: { parentIds: parentIdsArray } },
            { new: true },
          );
        }
        if (resourceName === 'audio') {
          await this.audio.findOneAndUpdate(
            { _id: resourceId },
            { $set: { parentIds: parentIdsArray } },
            { new: true },
          );
        }
        if (resourceName === 'essay') {
          await this.essay.findOneAndUpdate(
            { _id: resourceId },
            { $set: { parentIds: parentIdsArray } },
            { new: true },
          );
        }
        if (resourceName === 'pdf') {
          await this.pdf.findOneAndUpdate(
            { _id: resourceId },
            { $set: { parentIds: parentIdsArray } },
            { new: true },
          );
        }
        return res.status(200).json({ payload: 'success' });
      } else {
        return res.status(400).json({ msg: 'Forbidden request' });
      }
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
  async removeParentIdsFromResource({
    resourceName,
    resourceId,
    req,
    res,
  }: {
    resourceName: string;
    resourceId: string;
    req: Request;
    res: Response;
  }) {
    try {
      const decoded = await jwtIsValid(req?.signedCookies?.accessToken);
      if (decoded?.isAdmin === true) {
        if (resourceName === 'flashcard') {
          await this.flashcard.findOneAndUpdate(
            { _id: resourceId },
            { $set: { parentIds: [] } },
            { new: true },
          );
        }
        if (resourceName === 'mcq') {
          await this.mcq.findOneAndUpdate(
            { _id: resourceId },
            { $set: { parentIds: [] } },
            { new: true },
          );
        }
        if (resourceName === 'video') {
          await this.video.findOneAndUpdate(
            { _id: resourceId },
            { $set: { parentIds: [] } },
            { new: true },
          );
        }
        if (resourceName === 'audio') {
          await this.audio.findOneAndUpdate(
            { _id: resourceId },
            { $set: { parentIds: [] } },
            { new: true },
          );
        }
        if (resourceName === 'essay') {
          await this.essay.findOneAndUpdate(
            { _id: resourceId },
            { $set: { parentIds: [] } },
            { new: true },
          );
        }
        if (resourceName === 'pdf') {
          await this.pdf.findOneAndUpdate(
            { _id: resourceId },
            { $set: { parentIds: [] } },
            { new: true },
          );
        }
        return res.status(200).json({ payload: 'success' });
      } else {
        return res.status(400).json({ msg: 'Forbidden request' });
      }
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
  async adduserIdsToResourcePaymentArrays({
    resourceName,
    resourceId,
    settingsObj,
    res,
  }: {
    resourceName: string;
    resourceId: string;
    settingsObj: {
      subscribedUsersIds: { userName: string; userId: string };
      paidUsersIds: { userName: string; userId: string };
    };
    res: Response;
  }) {
    try {
      const { subscribedUsersIds, paidUsersIds } = settingsObj;
      if (subscribedUsersIds === undefined && paidUsersIds === undefined) {
        return res.status(400).json({ msg: 'Incomplete credentials' });
      }

      if (resourceName === 'flashcard') {
        if (settingsObj.subscribedUsersIds.userId) {
          await this.flashcard.findOneAndUpdate(
            { _id: resourceId },
            { $push: { subscribedUsersIds: settingsObj?.subscribedUsersIds } },
            { new: true },
          );
        } else {
          await this.flashcard.findOneAndUpdate(
            { _id: resourceId },
            { $push: { paidUsersIds: settingsObj?.paidUsersIds } },
            { new: true },
          );
        }
      }
      if (resourceName === 'mcq') {
        if (settingsObj.subscribedUsersIds.userId) {
          await this.mcq.findOneAndUpdate(
            { _id: resourceId },
            { $push: { subscribedUsersIds: settingsObj?.subscribedUsersIds } },
            { new: true },
          );
        } else {
          await this.mcq.findOneAndUpdate(
            { _id: resourceId },
            { $push: { paidUsersIds: settingsObj?.paidUsersIds } },
            { new: true },
          );
        }
      }
      if (resourceName === 'video') {
        if (settingsObj.subscribedUsersIds.userId) {
          await this.video.findOneAndUpdate(
            { _id: resourceId },
            { $push: { subscribedUsersIds: settingsObj?.subscribedUsersIds } },
            { new: true },
          );
        } else {
          await this.video.findOneAndUpdate(
            { _id: resourceId },
            { $push: { paidUsersIds: settingsObj?.paidUsersIds } },
            { new: true },
          );
        }
      }
      if (resourceName === 'audio') {
        if (settingsObj.subscribedUsersIds.userId) {
          await this.audio.findOneAndUpdate(
            { _id: resourceId },
            { $push: { subscribedUsersIds: settingsObj?.subscribedUsersIds } },
            { new: true },
          );
        } else {
          await this.audio.findOneAndUpdate(
            { _id: resourceId },
            { $push: { paidUsersIds: settingsObj?.paidUsersIds } },
            { new: true },
          );
        }
      }
      if (resourceName === 'essay') {
        if (settingsObj.subscribedUsersIds.userId) {
          await this.essay.findOneAndUpdate(
            { _id: resourceId },
            { $push: { subscribedUsersIds: settingsObj?.subscribedUsersIds } },
            { new: true },
          );
        } else {
          await this.essay.findOneAndUpdate(
            { _id: resourceId },
            { $push: { paidUsersIds: settingsObj?.paidUsersIds } },
            { new: true },
          );
        }
      }
      if (resourceName === 'pdf') {
        if (settingsObj.subscribedUsersIds.userId) {
          await this.pdf.findOneAndUpdate(
            { _id: resourceId },
            { $push: { subscribedUsersIds: settingsObj?.subscribedUsersIds } },
            { new: true },
          );
        } else {
          await this.pdf.findOneAndUpdate(
            { _id: resourceId },
            { $push: { paidUsersIds: settingsObj?.paidUsersIds } },
            { new: true },
          );
        }
      }
      return res.status(200).json({ payload: 'success' });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
  async monifyResource({
    resourceName,
    resourceId,
    settingsObj,
    req,
    res,
  }: {
    resourceName: string;
    resourceId: string;
    settingsObj: {
      purchasePrice?: number;
      subscriptionPrice?: number;
      subscriptionDurationNo?: number;
      subscriptionDurationUnit?: string;
      isSubscription: boolean;
      isPurchase: boolean;
    };
    req: Request;
    res: Response;
  }) {
    try {
      const decoded = await jwtIsValid(req?.signedCookies?.accessToken);
      if (decoded?.isAdmin === true) {
        const { isSubscription, isPurchase } = settingsObj;
        if (!isSubscription === undefined || isPurchase === undefined) {
          return res.status(400).json({ msg: 'Incomplete credentials' });
        }
        if (resourceName === 'flashcard') {
          await this.flashcard.findOneAndUpdate(
            { _id: resourceId },
            { $set: { ...settingsObj } },
            { new: true },
          );
        }
        if (resourceName === 'mcq') {
          await this.mcq.findOneAndUpdate(
            { _id: resourceId },
            { $set: { ...settingsObj } },
            { new: true },
          );
        }
        if (resourceName === 'video') {
          await this.video.findOneAndUpdate(
            { _id: resourceId },
            { $set: { ...settingsObj } },
            { new: true },
          );
        }
        if (resourceName === 'audio') {
          await this.audio.findOneAndUpdate(
            { _id: resourceId },
            { $set: { ...settingsObj } },
            { new: true },
          );
        }
        if (resourceName === 'essay') {
          await this.essay.findOneAndUpdate(
            { _id: resourceId },
            { $set: { ...settingsObj } },
            { new: true },
          );
        }
        if (resourceName === 'pdf') {
          await this.pdf.findOneAndUpdate(
            { _id: resourceId },
            { $set: { ...settingsObj } },
            { new: true },
          );
        }
        return res.status(200).json({ payload: 'success' });
      } else {
        return res.status(400).json({ msg: 'Forbidden request' });
      }
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
  async unmonifyResource({
    resourceName,
    resourceId,
    req,
    res,
  }: {
    resourceName: string;
    resourceId: string;
    req: Request;
    res: Response;
  }) {
    let settingsobj = {
      isPurchase: false,
      isSubscription: true,
      subscriptionDurationNo: 0,
      subscriptionDurationUnit: 'days',
      subscriptionPrice: 0,
    };
    try {
      const decoded = await jwtIsValid(req?.signedCookies?.accessToken);
      if (decoded?.isAdmin === true) {
        if (resourceName === 'flashcard') {
          await this.flashcard.findOneAndUpdate(
            { _id: resourceId },
            { $set: { ...settingsobj } },
            { new: true },
          );
        }
        if (resourceName === 'mcq') {
          await this.mcq.findOneAndUpdate(
            { _id: resourceId },
            { $set: { ...settingsobj } },
            { new: true },
          );
        }
        if (resourceName === 'video') {
          await this.video.findOneAndUpdate(
            { _id: resourceId },
            { $set: { ...settingsobj } },
            { new: true },
          );
        }
        if (resourceName === 'audio') {
          await this.audio.findOneAndUpdate(
            { _id: resourceId },
            { $set: { ...settingsobj } },
            { new: true },
          );
        }
        if (resourceName === 'essay') {
          await this.essay.findOneAndUpdate(
            { _id: resourceId },
            { $set: { ...settingsobj } },
            { new: true },
          );
        }
        if (resourceName === 'pdf') {
          await this.pdf.findOneAndUpdate(
            { _id: resourceId },
            { $set: { ...settingsobj } },
            { new: true },
          );
        }
        return res.status(200).json({ payload: 'success' });
      } else {
        return res.status(400).json({ msg: 'Forbidden request' });
      }
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
}
