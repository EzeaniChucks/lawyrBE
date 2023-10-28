import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request, Response } from 'express';
import { Model } from 'mongoose';
import {
  cardDetailsDTO,
  cardIdDTO,
  cardQAPairDTO,
} from 'src/flashcard/flashcards.dto';
import { canDeleteResource, jwtIsValid } from 'src/utils';
import {
  MCQBodyDTO,
  mcqBodyANDDetails,
  mcqDetailsDTO,
  mcqIdDTO,
} from './mcqs.dto';
import { NotifService } from 'src/notificationModule/notifService';
import { InvitationService } from 'src/invitationModule/invitationService';

@Injectable()
export class McqsService {
  constructor(
    @InjectModel('mcqs') private readonly mcqs: Model<any>,
    @InjectModel('grouptests') private readonly grouptests: Model<any>,
    @InjectModel('contents') private readonly contents: Model<any>,
    @InjectModel('auths') private readonly auth: Model<any>,
    private readonly notifService: NotifService,
    private readonly invitationService: InvitationService,
  ) {}
  async createMCQ(
    details: cardDetailsDTO,
    mcqBody: MCQBodyDTO,
    req: Request,
    res: Response,
  ) {
    try {
      const { scenarios, QAs } = mcqBody;
      const decoded = await jwtIsValid(req?.signedCookies?.accessToken);
      const flashcard = await this.mcqs.create({
        creatorId: decoded?._id,
        details,
        scenarios,
        QAs,
      });
      return res.status(201).json({ msg: 'success', payload: flashcard });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async getMCQ(mcqId: mcqIdDTO, res: Response) {
    try {
      const mcqs = await this.mcqs
        .findOne({ _id: mcqId })
        .select('details _id scenarios QAs creatorId');
      return res.status(200).json({ msg: 'success', payload: mcqs });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async getAllMCQs(req: Request, res: Response) {
    try {
      const mcqs = await this.mcqs
        .find()
        .select('details _id createdAt updatedAt');
      return res.status(200).json({ msg: 'success', payload: mcqs || [] });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async updateMCQ(
    mcqId: mcqIdDTO,
    details: mcqDetailsDTO,
    mcqBody: MCQBodyDTO,
    req: Request,
    res: Response,
  ) {
    try {
      const decoded = await jwtIsValid(req?.signedCookies?.accessToken);
      const confirmMCQCreator = await this.mcqs.findOne({
        _id: mcqId,
      });
      if (decoded._id !== confirmMCQCreator.creatorId.toString()) {
        res.status(400).json({
          msg: 'You can not perform this action.',
        });
      }
      const mcq = await this.mcqs
        .findOneAndUpdate(
          { _id: mcqId },
          {
            $set: { details, scenarios: mcqBody?.scenarios, QAs: mcqBody?.QAs },
          },
          { new: true },
        )
        .select('details _id scenarios QAs');
      return res.status(200).json({ msg: 'success', payload: mcq });
    } catch (err) {
      res.status(500).json({ msg: err?.message });
    }
  }
  async deleteMCQ(mcqId: mcqIdDTO, req: Request, res: Response) {
    try {
      const canDelete = await canDeleteResource(
        this.mcqs,
        mcqId,
        this.contents,
      );
      if (!canDelete?.payload) {
        return res.status(400).json({
          msg: `This resource belongs to superFolder ${canDelete?.extra}. You can edit the resource but deletion is not possible. Remove resource from '${canDelete?.extra}' to enable deletion.`,
        });
      } else if (typeof canDelete?.payload === 'string') {
        return res.status(400).json({ msg: canDelete });
      }
      const deletemcq = await this.mcqs.findOneAndDelete(
        { _id: mcqId },
        { new: true },
      );
      if (!deletemcq) {
        return res
          .status(400)
          .json({ msg: 'This mcq never existed or has been deleted' });
      }
      return this.getAllMCQs(req, res);
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async createAGroupTest(testObj: any, res: Response) {
    const {
      numberOfQuestions,
      numberOfScenarios,
      creatorId,
      details,
      testParticipantsIds,
      initialTestParticipants,
      clonedresourceId,
      testStartTimeMilliseconds,
    } = testObj;
    if (
      !creatorId ||
      !details ||
      !testParticipantsIds ||
      !initialTestParticipants ||
      !clonedresourceId ||
      !testStartTimeMilliseconds ||
      numberOfQuestions === null ||
      numberOfQuestions === undefined ||
      numberOfScenarios === null ||
      numberOfScenarios === undefined
    ) {
      return {
        msg: 'There are one or two missing fields in your submission. 8 of them should be present. Also check our documentation to ensure they are spelled correctly',
      };
    }
    try {
      const ongoingTest = await this.grouptests.findOne({
        creatorId: testObj?.creatorId,
        groupTestStatus: { $in: ['pending', 'ongoing'] },
      });
      if (ongoingTest) {
        return res
          .status(200)
          .json({ msg: 'open test still exists', payload: ongoingTest?._id });
      }
      const grouptest = await this.grouptests.create(testObj);
      if (!grouptest) {
        return res.status(400).json({ msg: 'Somthing went wrong' });
      }
      return res.status(200).json({ msg: 'success', payload: grouptest?._id });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async fetchAGroupTest(grouptestId: mcqIdDTO, userId: string, res: Response) {
    try {
      const ongoingTest = await this?.grouptests?.findOne({
        _id: grouptestId,
      });
      let userCanFetchTest = false;
      ongoingTest?.initialTestParticipants?.map(
        (each: { userId: string; canTakeTest: boolean }) => {
          if (each?.userId?.toString() === userId) {
            userCanFetchTest = true;
          }
          return;
        },
      );
      if (!userCanFetchTest) {
        return res
          ?.status(400)
          ?.json({ msg: 'You have not been invited to this test yet' });
      }

      //confirm to see if a new participant can now take test, e.g. user that recently paid for the resource
      let mcqId = ongoingTest?.clonedresourceId;
      let mcq = await this.mcqs.findOne({ _id: mcqId });
      let updatedFriendsArray = [];
      //blocking code
      if (mcq?.isSubscription) {
        for (let eachId of ongoingTest?.initialTestParticipants) {
          let found = mcq?.subscribedUsersIds.find(
            (subUsers: { userId: string }) => {
              return subUsers?.userId.toString() === eachId?.userId.toString();
            },
          );
          if (found) {
            updatedFriendsArray.push({
              userId: eachId?.userId,
              canTakeTest: true,
              userName: eachId?.userName,
            });
          } else {
            updatedFriendsArray.push({
              userId: eachId?.userId,
              canTakeTest: false,
              userName: eachId?.userName,
            });
          }
        }
      } else if (mcq?.isPurchase) {
        for (let eachId of ongoingTest?.initialTestParticipants) {
          const found = mcq?.paidUsersIds.find(
            (paidUsers: { userId: string }) => {
              return paidUsers?.userId.toString() === eachId?.userId.toString();
            },
          );
          if (found) {
            updatedFriendsArray.push({
              userId: eachId?.userId,
              canTakeTest: true,
              userName: eachId?.userName,
            });
          } else {
            updatedFriendsArray.push({
              userId: eachId?.userId,
              canTakeTest: false,
              userName: eachId?.userName,
            });
          }
        }
      } else {
        ongoingTest?.initialTestParticipants?.map((eachUser) => {
          updatedFriendsArray.push({
            userId: eachUser.userId,
            canTakeTest: true,
            userName: eachUser.userName,
          });
          return;
        });
      }
      //end of blocking code
      const groupTestupdate = await this.grouptests.findOneAndUpdate(
        { _id: grouptestId },
        { $set: { initialTestParticipants: updatedFriendsArray } },
        { new: true },
      );
      return res?.status(200)?.json({
        msg: 'success',
        payload: { ...groupTestupdate._doc, parentFolderIds: mcq?.parentIds },
      });
    } catch (err) {
      return res?.status(500)?.json({ msg: err?.message });
    }
  }
  async endAGroupTest(groupTestId: mcqIdDTO, res: Response) {
    try {
      const updatedTest = await this.grouptests.findOneAndUpdate(
        { _id: groupTestId },
        { $set: { groupTestStatus: 'completed' } },
        { new: true },
      );
      if (!updatedTest) {
        return res.status(400).json({ msg: 'Something went wrong' });
      }
      return res.status(200).json({ msg: 'success', payload: updatedTest });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async deleteAGroupTest(groupTestId: mcqIdDTO, userId: string, res: Response) {
    try {
      const group = await this.grouptests.findOne({
        _id: groupTestId,
        creatorId: userId,
      });

      if (!group) {
        return res
          .status(400)
          .json({ msg: 'You are not authorized to perform this action' });
      }
      const updatedTest = await this.grouptests.findOneAndDelete(
        { _id: groupTestId },
        { new: true },
      );
      if (!updatedTest) {
        return res.status(400).json({ msg: 'Somthing went wrong' });
      }
      return res.status(200).json({ msg: 'success', payload: 'deleted' });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async searchUsersToInviteToGroupTest(searchWord: string, res: Response) {
    try {
      if (searchWord) {
        const users = await this.auth
          .find({
            isAdmin: false,
            $or: [
              { firstName: { $regex: searchWord, $options: 'xi' } },
              { lastName: { $regex: searchWord, $options: 'xi' } },
            ],
          })
          .select('firstName lastName _id');
        return res.status(200).json({ msg: 'success', payload: users });
      } else {
        return res.status(200).json({ msg: 'success', payload: [] });
      }
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async inviteFriendsToGroupTest(
    inviteesIdArrays: { userId: string; userName: string }[],
    originalmcqId: string,
    grouptestId: string,
    folderId: string,
    folderName: string,
    res: Response,
  ) {
    try {
      const updatedFriendsArray = [];
      let mcq = await this.mcqs.findOne({ _id: originalmcqId });

      //blocking code
      if (mcq?.isSubscription) {
        for (let eachId of inviteesIdArrays) {
          let found = mcq?.subscribedUsersIds.find(
            (subUsers: { userId: string }) => {
              return subUsers?.userId.toString() === eachId?.userId;
            },
          );
          if (found) {
            updatedFriendsArray.push({
              userId: eachId?.userId,
              canTakeTest: true,
              userName: eachId?.userName,
            });
          } else {
            updatedFriendsArray.push({
              userId: eachId?.userId,
              canTakeTest: false,
              userName: eachId?.userName,
            });
          }
        }
      } else if (mcq?.isPurchase) {
        for (let eachId of inviteesIdArrays) {
          const found = mcq?.paidUsersIds.find(
            (paidUsers: { userId: string }) => {
              return paidUsers?.userId.toString() === eachId?.userId;
            },
          );
          if (found) {
            updatedFriendsArray.push({
              userId: eachId?.userId,
              canTakeTest: true,
              userName: eachId?.userName,
            });
          } else {
            updatedFriendsArray.push({
              userId: eachId?.userId,
              canTakeTest: false,
              userName: eachId?.userName,
            });
          }
        }
      } else {
        inviteesIdArrays?.map((eachfriend) => {
          updatedFriendsArray.push({
            userId: eachfriend.userId,
            canTakeTest: true,
            userName: eachfriend.userName,
          });
          return;
        });
      }
      //end of blocking code

      const groupTest = await this.grouptests.findOne({ _id: grouptestId });

      //blocking code, checks if a user from UpdateFriendsArray is already in the initialTestParticiapnts list
      //just to avoid adding participants from the frontend that already on the database particiapants list
      let newArr = [...groupTest?.initialTestParticipants];
      updatedFriendsArray.map((eachfriend: { userId: string }) => {
        let itemexist = false;
        groupTest?.initialTestParticipants.map(
          (eachPart: { userId: string }) => {
            if (eachfriend.userId.toString() === eachPart?.userId.toString()) {
              itemexist = true;
            }
          },
        );
        if (!itemexist) {
          newArr.push(eachfriend);
        }
        return;
      });
      //end of blocking code

      const logInviteArr = JSON.parse(JSON.stringify(newArr));
      await this.invitationService.loginvitations(
        'You have been invited to a group test',
        `/user/${folderName}/${folderId}/mcq/${originalmcqId}/grouptest/${grouptestId}`,
        [
          ...logInviteArr?.splice(
            groupTest?.initialTestParticipants.length,
            newArr?.length,
          ),
        ],
      );

      const groupTestupdate = await this.grouptests.findOneAndUpdate(
        { _id: grouptestId },
        { $set: { initialTestParticipants: newArr } },
        { new: true },
      );

      return res.status(200).json({ msg: 'success', payload: groupTestupdate });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
  async viewResultsWithCorrections({
    grouptestId,
    userId,
    res,
  }: {
    grouptestId: string;
    userId: string;
    res: Response;
  }) {
    try {
      const user = await this.auth.findOne({ _id: userId });
      const particularMCQ = user.groupMcqs.find((eachgroupmcq: any) => {
        return eachgroupmcq.grouptestId.toString() === grouptestId.toString();
      });
      if (!particularMCQ) {
        return res.status(400).json({
          msg: "This user's result was not found. This normally shouldn't happen. Refresh page or contact us",
        });
      }
      return res.status(200).json({ msg: 'success', payload: particularMCQ });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
};