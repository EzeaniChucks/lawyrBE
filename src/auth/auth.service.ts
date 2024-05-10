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
import {
  MCQScenarios,
  MCQuestionsDTO,
  mcqBodyANDDetails,
  mcqDetailsDTO,
} from 'src/mcqs/mcqs.dto';
import * as emailjs from '@emailjs/nodejs';
import cryptos from 'crypto';
import { PaymentService } from 'src/paymentModule/payment.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('auths') private readonly user: Model<any>,
    private readonly paymentservice: PaymentService,
  ) {}

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
      const user = await this.user.findOne({_id:decoded._id});
      const {
        _id,
        email,
        firstName,
        lastName,
        phoneNumber,
        isVerified,
        assets,
      } = user;
      return res
        .status(200)
        .json({
          _id,
          email,
          firstName,
          lastName,
          phoneNumber,
          isVerified,
          assets,
        });
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
          isAdmin,
          assets,
        } = user;

        await attachCookiesToResponse(res, {
          _id,
          firstName,
          lastName,
          email,
          phoneNumber,
          isAdmin,
          assets,
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
        email:user?.email,
        phoneNumber: user?.phoneNumber || '',
        isAdmin: user?.isAdmin,
        assets: user.assets,
      };
      await attachCookiesToResponse(res, tokenUser);
      return res.status(200).json({ msg: 'Success' });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }

  async sendResetPassToEmail(email: string, res: Response) {
    try {
      const useremail = await this.user.findOne({ email });
      if (!useremail) {
        return res.status(400).json({
          msg: 'This user email does not exist. Please go back and register afresh',
        });
      }
      const resetToken = cryptos.randomBytes(40).toString('hex');
      const tokenifiedUser = await this.user.findOneAndUpdate(
        { email },
        { $set: { verificationToken: resetToken } },
        { new: true },
      );
      if (!tokenifiedUser) {
        return res.status(400).json({
          msg: 'Token could not be generated. Contact customer care with this error',
        });
      }

      emailjs
        .send(
          'service_n45yy8t',
          'template_22ku158',
          {
            name: `${tokenifiedUser?.firstName} ${tokenifiedUser?.lastName}`,
            email: `${tokenifiedUser.email}`,
            // email: 'testingtestguy1@gmail.com',
            message: `
                    <div>
                      <h4>CharityOrg Account Password reset</h4>
                      <h5>Click on the button below to reset your password</h5>
                      <button><a style='padding:5px; border-radius:10px;' href='${process.env.FRONT_END_CONNECTION}/resetPassword?verificationToken=${resetToken}&email=${tokenifiedUser?.email}'>Reset Password</a></button>
                      </div>
                  `,
          },
          {
            publicKey: '7UpYhI4ulL04ybL_j',
            privateKey: 't-HI5fwlLdMx_qOM7QfRx',
          },
        )
        .then(
          (response) => {
            return res.status(200).json({
              msg: `success! we sent an email to you at ${tokenifiedUser.email}. Please visit to reset your password`,
              payload: response,
            });
          },
          (err) => {
            return res.status(400).json({ msg: 'unsuccessful', payload: err });
          },
        );
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }

  async resetPassword(
    resetToken: string,
    email: string,
    password: string,
    res: Response,
  ) {
    try {
      const user = await this.user.findOne({ email });
      if (!user) {
        return res.status(400).json({
          msg: 'No user with this email. Please try registering',
        });
      }
      if (user.verificationToken !== resetToken) {
        return res.status(400).json({
          msg: 'false or expired token',
        });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedpass = await bcrypt.hash(password, salt);

      user.password = hashedpass;
      user.isVerified = true;
      user.verified = Date.now();
      user.verificationToken = '';
      await user.save();

      const { _id, firstName, lastName, phoneNumber, isAdmin } = user;
      await this.paymentservice.validateUserWallet(_id);
      await attachCookiesToResponse(res, {
        _id,
        firstName,
        lastName,
        phoneNumber,
        email,
        isAdmin,
        assets: [{ subscriptions: [], purchases: [], cart: [] }],
      });
      return res.status(200).json({
        msg: 'password reset successful',
        user: {
          _id,
          email: user.email,
          firstName,
          lastName,
          phoneNumber,
        },
      });
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
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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
      expiryDate: String;
    },
    res: Response,
  ) {
    try {
      //check if test already exist and is ongoing.
      //if ongoing, reject addition. Don't forget.
      const aTestIsAlreadyOngoing = await this.user.findOne({
        _id: userId,
        mcqs: { $elemMatch: { status: 'ongoing' } },
      });
      if (aTestIsAlreadyOngoing) {
        const singleTest = aTestIsAlreadyOngoing?.mcqs?.find(
          (test: any) => test?.status === 'ongoing',
        ); //returns the newly added mcq obj, which is last on the array
        return res.status(200).json({
          msg: 'You already have an ongoing test',
          payload: singleTest._id,
        });
      }
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
        msg: 'success',
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
        (each: any) => each._id.toString() === mcqId.toString(),
      );
      if (!userobj || !currentMCQ) {
        return res
          .status(400)
          .json({ msg: 'Bad request. Something went wrong.' });
      }
      // let newres = currentMCQ.QAs.map((element: MCQuestionsDTO) => {
      //   delete element.answer;
      //   return element;
      // });
      // console.log(newres, currentMCQ);
      return res.status(200).json({ msg: 'success', payload: currentMCQ });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }

  async fetchAllCompletedMCQs(userId: string, res: Response) {
    try {
      const userobj = await this.user.findOne({ _id: userId });
      let fakedate: number = 0;
      const allMCQs = userobj.mcqs.map((each: any) => {
        fakedate++;
        return {
          mcqDetails: each?.mcqDetails,
          _id: each?._id,
          status: each?.status,
          totalRightQuestions: each?.totalRightQuestions,
          questionLength: each?.QAs?.length || 0,
          createdAt:
            each?.createdAt ||
            new Date(Date.now() - fakedate * 24 * 60 * 60 * 1000),
          updatedAt:
            each?.updatedAt ||
            new Date(Date.now() - fakedate * 24 * 60 * 60 * 800),
        };
      });
      if (!userobj || !allMCQs) {
        return res
          .status(400)
          .json({ msg: 'Bad request. Something went wrong.' });
      }
      return res.status(200).json({ msg: 'success', payload: allMCQs });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }

  async fetchAllCompletedGroupTests(userId: string, res: Response) {
    try {
      const userobj = await this.user.findOne({ _id: userId });
      let fakedate: number = 0;
      const allMCQs = userobj.groupMcqs.map((each: any) => {
        fakedate++;
        return {
          mcqDetails: each?.mcqDetails,
          _id: each?._id,
          status: each?.status,
          totalRightQuestions: each?.totalRightQuestions,
          questionLength: each?.QAs?.length || 0,
          createdAt:
            each?.createdAt ||
            new Date(Date.now() - fakedate * 24 * 60 * 60 * 1000),
          updatedAt:
            each?.updatedAt ||
            new Date(Date.now() - fakedate * 24 * 60 * 60 * 800),
        };
      });
      if (!userobj || !allMCQs) {
        return res
          .status(400)
          .json({ msg: 'Bad request. Something went wrong.' });
      }
      return res.status(200).json({ msg: 'success', payload: allMCQs });
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
      const isDateExpired = checkuser?.mcqs?.find((eachQa: MCQuestionsDTO) => {
        return eachQa?._id.toString() === mcqId;
      });
      if (!isDateExpired) {
        return res
          .status(400)
          .json({ msg: 'Bad request. Could not determine date expiration.' });
      }
      if (isDateExpired?.expiryDate <= new Date()) {
        return res.status(400).json({
          msg: 'You cannot pick answers on an expired Test. Try taking a new test',
        });
      }
      const userobj = await this?.user?.findOneAndUpdate(
        { _id: userId, 'mcqs._id': mcqId },
        { $set: { 'mcqs.$.QAs': QAs } },
        { new: true },
      );

      //blocking code below. Will put it in a child process later
      const currentMCQ = userobj?.mcqs?.find(
        (each: MCQuestionsDTO) => each?._id.toString() === mcqId,
      );
      //end of blocking code.

      if (!userobj || !currentMCQ) {
        return res.status(400).json({
          msg: 'Bad request. Something went wrong. Please try again.',
        });
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
      const currentMCQ = userobj?.mcqs?.find(
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

  //For Group MCQS
  async startGroupMCQTest(
    userId: string,
    mcq: {
      grouptestId: string;
      creatorId: string;
      clonedresourceId: string;
      mcqDetails: mcqDetailsDTO;
      QAs: MCQuestionsDTO[];
      scenarios: MCQScenarios[];
      expiryDate: String;
    },
    res: Response,
  ) {
    try {
      //check if test already exist and is ongoing.
      //if ongoing, reject addition. Don't forget.
      const aTestIsAlreadyOngoing = await this.user.findOne({
        _id: userId,
        groupMcqs: { $elemMatch: { grouptestId: mcq?.grouptestId } },
      });
      if (aTestIsAlreadyOngoing) {
        const singleTest = aTestIsAlreadyOngoing?.groupMcqs?.find(
          (test: any) =>
            test?.grouptestId.toString() === mcq?.grouptestId.toString(),
        ); //returns the newly added groupMcq obj, which is last in the array
        return res.status(200).json({
          msg: 'group test already written',
          payload: singleTest?._id,
        });
      }
      const result = await this.user.findOneAndUpdate(
        { _id: userId },
        { $push: { groupMcqs: mcq } },
        { new: true },
      );
      if (!result) {
        return res.status(400).json({ msg: 'Something went wrong' });
      }
      const newresult = result.groupMcqs.slice(-1)[0]; //returns the newly added mcq obj, which is last on the array
      return res.status(200).json({
        msg: 'success',
        payload: newresult?._id,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
  async fetchCurrentOngoingGroupMCQ(
    userId: string,
    mcqId: string,
    res: Response,
  ) {
    try {
      const userobj = await this.user.findOne({ _id: userId });
      const currentMCQ = userobj.groupMcqs.find(
        (each: any) => each._id.toString() === mcqId,
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
  async fetchAllCompletedGroupMCQs(userId: string, res: Response) {
    try {
      const userobj = await this.user.findOne({ _id: userId });
      const allMCQs = userobj.groupMcqs.map((each: any) => {
        return { mcqDetails: each.mcqDetails, _id: each._id };
      });
      if (!userobj || !allMCQs) {
        return res
          .status(400)
          .json({ msg: 'Bad request. Something went wrong.' });
      }
      return res.status(200).json({ msg: 'success', payload: allMCQs });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
  async editOngoingGroupMCQ(
    userId: string,
    QAs: MCQuestionsDTO[],
    mcqId: string,
    res: Response,
  ) {
    try {
      const checkuser = await this.user.findOne({ _id: userId });
      const isDateExpired = checkuser?.groupMcqs?.find(
        (eachQa: MCQuestionsDTO) => {
          return eachQa?._id.toString() === mcqId;
        },
      );
      if (!isDateExpired) {
        return res
          .status(400)
          .json({ msg: 'Bad request. Could not determine date expiration.' });
      }
      if (isDateExpired?.expiryDate <= new Date()) {
        return res.status(400).json({
          msg: 'You cannot pick answers on an expired Test. Try taking a new test',
        });
      }
      const userobj = await this?.user?.findOneAndUpdate(
        { _id: userId, 'groupMcqs._id': mcqId },
        { $set: { 'groupMcqs.$.QAs': QAs } },
        { new: true },
      );

      //blocking code below. Will put it in a child process later
      const currentMCQ = userobj?.groupMcqs?.find(
        (each: MCQuestionsDTO) => each?._id.toString() === mcqId,
      );
      //end of blocking code.

      if (!userobj || !currentMCQ) {
        return res.status(400).json({
          msg: 'Bad request. Something went wrong. Please try again.',
        });
      }

      return res.status(200).json({ msg: 'success', payload: currentMCQ });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
  async endOngoingGroupMCQ(
    userId: string,
    QAs: MCQuestionsDTO[],
    mcqId: string,
    res: Response,
  ) {
    try {
      const userobj = await this.user.findOneAndUpdate(
        { _id: userId, 'groupMcqs._id': mcqId },
        { $set: { 'groupMcqs.$.QAs': QAs } },
        { new: true },
      );
      const currentMCQ = userobj?.groupMcqs?.find(
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
        { _id: userId, 'groupMcqs._id': mcqId },
        {
          $set: {
            'groupMcqs.$.totalAnsweredQuestions': totalAnsweredQuestions,
            'groupMcqs.$.totalRightQuestions': totalRightQuestions,
            'groupMcqs.$.totalWrongQuestions': totalWrongQuestions,
            'groupMcqs.$.expiryDate': new Date(),
            'groupMcqs.$.status': 'completed',
          },
        },
        { new: true },
      );

      if (!userobj || !currentMCQ || !finaluser) {
        return res
          .status(400)
          .json({ msg: 'Bad request. Something went off.' });
      }
      const currentMCQofUpdatedUser = finaluser?.groupMcqs?.find(
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
