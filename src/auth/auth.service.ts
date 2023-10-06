import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginDTO, RegisterDTO } from './auth.dto';
import { attachCookiesToResponse, jwtIsValid } from 'src/utils';
import { InjectModel } from '@nestjs/mongoose';
import { Date, Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { MCQScenarios, MCQuestionsDTO, mcqDetailsDTO } from 'src/mcqs/mcqs.dto';

@Injectable()
export class AuthService {
  constructor(@InjectModel('auth') private readonly user: Model<any>) {}

  async isLoggedIn(req: Request, res: Response) {
    try {
      const decoded = await jwtIsValid(req?.signedCookies?.accessToken);
      if (decoded) {
        return res.status(200).json(true);
      } else {
        return res.status(400).json(false);
      }
    } catch (err) {
      res.status(500).json(false);
    }
  }
  async isAdmin(req: Request, res: Response) {
    try {
      const decoded = await jwtIsValid(req?.signedCookies?.accessToken);
      if (decoded?.isAdmin === true) {
        return res.status(200).json(true);
      } else {
        return res.status(400).json(false);
      }
    } catch (err) {
      res.status(500).json(false);
    }
  }
  async getFullUserDetails(req: Request, res: Response) {
    try {
      const decoded = await jwtIsValid(req?.signedCookies?.accessToken);
      return res.status(200).json({ ...decoded, isAdmin: null });
    } catch (err) {
      return res.status(500).json(err?.message);
    }
  }
  async login(body: LoginDTO, res: Response) {
    const { email, password } = body;
    try {
      if (!email || !password) {
        throw new BadRequestException({ msg: 'Provide complete credentials' });
      }
      const user = await this.user.findOne({ email });
      if (!user) {
        return res.status(400).json({
          msg: 'Forbidden request. Incorrect credentials',
        });
      }
      const passIsValid = await bcrypt.compare(password, user?.password);
      if (passIsValid) {
        const {
          _id,
          email,
          firstName,
          lastName,
          phoneNumber,
          isVerified,
          isAdmin,
        } = user;

        await attachCookiesToResponse(res, {
          _id,
          firstName,
          lastName,
          phoneNumber,
          isAdmin,
        });

        return res.status(200).json({
          msg: 'Success',
          // user: { _id, email, firstName, lastName, phoneNumber },
        });
      } else {
        return res.status(400).json({ msg: 'wrong email or password' });
      }
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async register(body: RegisterDTO, res: Response) {
    const { email, password, firstName, lastName } = body;
    try {
      if (!email || !password || !firstName || !lastName) {
        throw new BadRequestException({
          msg: 'Provide the necessary credentials',
        });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(password, salt);
      const userExists = await this.user.findOne({ email });
      if (userExists) {
        return res.status(400).json({ msg: 'User email already exists' });
      }
      const user = await this.user.create({ ...body, password: hashedPass });
      const tokenUser = {
        _id: user?._id,
        firstName: user?.firstName,
        lastName: user?.lastName,
        phoneNumber: user?.phoneNumber || '',
        isAdmin: user?.isAdmin,
      };
      await attachCookiesToResponse(res, tokenUser);
      return res.status(200).json({ msg: 'Success' });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async signout(res: Response) {
    try {
      res.cookie(
        'accessToken',
        {},
        {
          httpOnly: true,
          expires: new Date(Date.now()),
          secure: process.env.NODE_ENV === 'production',
          signed: true,
        },
      );
      return res.status(200).json({ msg: 'logout successful' });
    } catch (err) {
      return res.status(500).json({ mag: err?.message });
    }
  }
  async startMCQTest(
    userId: string,
    mcq: {
      creatorId: string;
      clonedresourceId: string;
      mcqDetails: mcqDetailsDTO;
      QAs: MCQuestionsDTO[];
      scenarios: MCQScenarios[];
      expiryDate: Date;
    },
    res: Response,
  ) {
    try {
      //check if test already exist and is ongoing.
      //if ongoing, reject addition. Don't forget.
      const result = await this.user.findOneAndUpdate(
        { _id: userId },
        { $push: { mcqs: mcq } },
        { new: true },
      );
      if (!result) {
        return res.status(400).json({ msg: 'Something went wrong' });
      }
      const newresult = result.mcqs.slice(-1)[0]; //returns the newly added mcq obj, which is last on the array
      return res.status(200).json({
        msg: 'Success',
        payload: newresult?._id,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
  async fetchCurrentOngoingMCQ(userId: string, mcqId: string, res: Response) {
    try {
      const userobj = await this.user.findOne({ _id: userId });
      const currentMCQ = userobj.mcqs.find(
        (each: MCQuestionsDTO) => each._id.toString() === mcqId,
      );
      if (!userobj || !currentMCQ) {
        return res
          .status(400)
          .json({ msg: 'Bad request. Something went wrong.' });
      }
      return res.status(200).json({ msg: 'success', payload: currentMCQ });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
  async editOngoingMCQ(
    userId: string,
    QAs: MCQuestionsDTO[],
    mcqId: string,
    res: Response,
  ) {
    try {
      const checkuser = await this.user.findOne({ _id: userId });
      const isDateExpired = checkuser.mcqs.QAs.find(
        (eachQa: MCQuestionsDTO) => {
          return eachQa?._id === mcqId;
        },
      );
      if (!isDateExpired) {
        return res
          .status(400)
          .json({ msg: 'Bad request. Something went off.' });
      }
      if (isDateExpired.expiryDate <= new Date()) {
        return res.status(400).json({
          msg: 'You cannot pick answers on an expired Test. Try taking a new test',
        });
      }
      const userobj = await this.user.findOneAndUpdate(
        { _id: userId, 'mcqs._id': mcqId },
        { $set: { 'mcqs.$.QAs': QAs } },
        { new: true },
      );

      //blocking code below. Will put it in a child process later
      const currentMCQ = userobj.mcqs.find(
        (each: MCQuestionsDTO) => each?._id.toString() === mcqId,
      );
      //end of blocking code.

      if (!userobj || !currentMCQ) {
        return res
          .status(400)
          .json({ msg: 'Bad request. Something went off.' });
      }

      return res.status(200).json({ msg: 'success', payload: currentMCQ });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
  async endOngoingMCQ(
    userId: string,
    QAs: MCQuestionsDTO[],
    mcqId: string,
    res: Response,
  ) {
    try {
      const userobj = await this.user.findOneAndUpdate(
        { _id: userId, 'mcqs._id': mcqId },
        { $set: { 'mcqs.$.QAs': QAs } },
        { new: true },
      );
      const currentMCQ = userobj.mcqs.find(
        (each: MCQuestionsDTO) => each?._id.toString() === mcqId,
      );
      let totalAnsweredQuestions = 0;
      let totalRightQuestions = 0;
      let totalWrongQuestions = 0;
      //blocking code below. Will move them into a child process soon
      currentMCQ?.QAs?.map((eachQa: MCQuestionsDTO) => {
        if (eachQa?.candidate_answer === eachQa?.answer) {
          totalRightQuestions++;
        }
        if (
          eachQa?.candidate_answer !== '' &&
          eachQa.candidate_answer !== eachQa?.answer
        ) {
          totalWrongQuestions++;
        }
        if (eachQa?.candidate_answer !== '') {
          totalAnsweredQuestions++;
        }
      });
      //end of blocking code;

      const finaluser = await this.user.findOneAndUpdate(
        { _id: userId, 'mcqs._id': mcqId },
        {
          $set: {
            'mcqs.$.totalAnsweredQuestions': totalAnsweredQuestions,
            'mcqs.$.totalRightQuestions': totalRightQuestions,
            'mcqs.$.totalWrongQuestions': totalWrongQuestions,
            'mcqs.$.expiryDate': new Date(),
            'mcqs.$.status': 'completed',
          },
        },
        { new: true },
      );

      if (!userobj || !currentMCQ || !finaluser) {
        return res
          .status(400)
          .json({ msg: 'Bad request. Something went off.' });
      }
      const currentMCQofUpdatedUser = finaluser?.mcqs?.find(
        (each: MCQuestionsDTO) => each?._id.toString() === mcqId,
      );
      return res
        .status(200)
        .json({ msg: 'success', payload: currentMCQofUpdatedUser });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
}
