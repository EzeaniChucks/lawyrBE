import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel('testchats') private readonly testchats: Model<any>,
    @InjectModel('grouptests') private readonly grouptests: Model<any>,
    @InjectModel('auths') private readonly auth: Model<any>,
  ) {}
  // messages: any[] = [{ name: 'Bot', text: 'Welcome to this chatroom' }];
  clientToUser = {};

  async create(createMessageDto: any) {
    const message = { ...createMessageDto };
    const { grouptestId, userId, name, text } = createMessageDto;
    // this.messages.push(createMessageDto); //todo
    const chatExists = await this.testchats.findOne({ grouptestId });
    if (chatExists?.chats?.length === 1 && chatExists.chats[0].name === 'Bot') {
      await this.testchats.findOneAndUpdate(
        { grouptestId },
        { $set: { chats: { userId, name, text } } },
        { new: true },
      );
    } else {
      await this.testchats.findOneAndUpdate(
        { grouptestId },
        { $push: { chats: { userId, name, text } } },
        { new: true },
      );
    }
    return message;
  }

  async findAll(grouptestId: string) {
    const chatExists = await this.testchats.findOne({ grouptestId });
    if (chatExists) {
      return chatExists?.chats;
    } else {
      let chatObject = await this.testchats.create({
        grouptestId,
        chats: [
          {
            name: 'Bot',
            text: 'Welcome to this chatroom. Be the first to leave a message',
          },
        ],
      });
      return chatObject.chats;
    }
    // return this.messages; //select all messages from database
  }

  identify(name: string, userId: string, clientId: string, roomId: string) {
    // console.log(roomId, userId, clientId, name);
    let userExists = false;
    if (this.clientToUser[roomId]) {
      for (let clients in this.clientToUser[roomId]) {
        let clientInfo = this.clientToUser[roomId][clients];
        if (Object.values(clientInfo)[0] === userId) {
          userExists = true;
        }
      }
      if (!userExists) {
        this.clientToUser[roomId] = {
          ...this.clientToUser[roomId],
          [clientId]: { [name]: userId },
        };
      }
    } else {
      this.clientToUser[roomId] = {
        [clientId]: { [name]: userId },
      };
    }
    // console.log(this.clientToUser);
    return Object.values(this.clientToUser[roomId]);
  }

  getClientName(clientId: string, roomId: string) {
    const userObj = this.clientToUser[roomId]; //check whether roomId is present. Will break break server if not checked
    const userObject = userObj ? userObj[clientId] : {};
    return Object.keys(userObject)[0];
  }

  removeClientFromRoom(clientId: string) {
    let roomId = undefined;
    for (let room in this.clientToUser) {
      for (let clientidentity in this.clientToUser[room]) {
        if (clientidentity === clientId) {
          delete this.clientToUser[room][clientId];
          roomId = room;
        }
      }
      return {
        grouptestId: roomId,
        newUsers: this.clientToUser[roomId]
          ? Object.values(this.clientToUser[roomId])
          : [],
      };
    }
    return this.clientToUser[clientId];
  }
  async startGroupTest(grouptestId: string, creatorId: string) {
    try {
      let qualifiedTestTakersIds: { userId: string; userName: string }[] = [];

      let grouptest = await this.grouptests.findOne({ _id: grouptestId });
      if (!grouptest) {
        return {
          msg: 'This group test does not exist. It may have been deleted',
        };
      }

      if (grouptest.creatorId.toString() !== creatorId.toString()) {
        return { msg: 'You cannot perform this action' };
      }

      grouptest?.initialTestParticipants.map(
        // use this to get an array of only qualified ids
        (each: { userId: string; canTakeTest: boolean; userName: string }) => {
          if (each?.canTakeTest)
            qualifiedTestTakersIds.push({
              userId: each?.userId,
              userName: each?.userName,
            });
        },
      );

      //compute a date string from the grouptest's minute variable, to expire in the future
      let newDateString = new Date(
        Date.now() + grouptest.testStartTimeMilliseconds * 60 * 1000,
      );
      
      let result = await this.grouptests.findOneAndUpdate(
        { _id: grouptest, creatorId },
        {
          $set: {
            testParticipantsIds: qualifiedTestTakersIds,
            groupTestStatus: 'ongoing',
            testStartTimeString: newDateString,
          },
        },
        { new: true },
      );
      return result;
    } catch (err) {
      return { msg: err.message };
    }
  }
  // findOne(id: number) {
  //   return `This action returns a #${id} message`;
  // }

  // update(id: number, updateMessageDto: UpdateMessageDto) {
  //   return `This action updates a #${id} message`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} message`;
  // }
}
