import {
  BadGatewayException,
  ForbiddenException,
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  Res,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as request from 'request';
import * as Flutterwave from 'flutterwave-node-v3';
// import * as coinbase from 'coinbase-commerce-node';
// import * as coinbase2 from 'coinbase';
// import { currency_array } from '../util';
import { Response, response } from 'express';
// import { AuthService } from 'src/authModule/auth.service';
import { ModuleRef } from '@nestjs/core';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel('walletTransaction') private wallettransaction: Model<any>,
    @InjectModel('transaction') private transaction: Model<any>,
    @InjectModel('wallet') private wallet: Model<any>,
    @InjectModel('auths') private User: Model<any>, // private readonly moduleRef: ModuleRef,
    // private authservice: AuthService,
  ) // @Inject(forwardRef(() => AuthService))
  {}

  //HELPER FUNCTIONS

  async updateWalletTransactionStatus(
    walletTransactionId: string,
    status: string,
    narration: string,
    link?: string,
  ) {
    return await this.wallettransaction.findOneAndUpdate(
      { _id: walletTransactionId },
      { $set: { status, narration, link: link ? link : '' } },
      { new: true },
    );
  }
  async updateTransactionStatus(
    transactionId: string,
    status: string,
    narration: string,
    link?: string,
  ) {
    return await this.transaction.findOneAndUpdate(
      { transactionId },
      { $set: { paymentStatus: status, narration, link: link ? link : '' } },
      { new: true },
    );
  }
  async deleteWalletTransaction(walletTransactionId: string) {
    return await this.wallettransaction.findOneAndDelete({
      _id: walletTransactionId,
    });
  }
  async deleteTransaction(transactionId: string) {
    return await this.transaction.findOneAndDelete({ transactionId });
  }
  async fetchWalletTransaction(walletTransactionId: string) {
    return await this.wallettransaction.findOne({ _id: walletTransactionId });
  }
  async fetchTransaction(transactionId: string) {
    return await this.transaction.findOne({ transactionId });
  }

  //HELPER METHODS
  async validateUserWallet(userId: string) {
    const user = await this.User.findOne({ _id: userId });
    if (!user) {
      throw new BadRequestException(
        'No user with this credential exists. Enter right credential or create a new account',
      );
    }
    const userWallet = await this.wallet.findOne({ userId });
    if (!userWallet) {
      const newWallet = await this.wallet.create({
        userId,
      });
      return newWallet;
    }
    return userWallet;
  }
  async createWalletTransactions(
    userId: string,
    status: string,
    amount: string | number,
    description: string,
    narration: string,
  ) {
    const walletTransaction = await this.wallettransaction.create({
      amount,
      userId,
      isInflow: true,
      status,
      description,
      narration,
    });
    return walletTransaction;
  }
  async createTransaction(
    userId: string,
    id: string,
    status: string,
    amount: string | number,
    customer: { name: string; email: string; phone_number: string },
    tx_ref: string,
    description: string,
    narration: string,
  ) {
    const transaction = this.transaction.create({
      userId,
      transactionId: id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone_number,
      amount,
      tx_ref,
      paymentStatus: status,
      description,
      narration,
    });
    return transaction;
  }
  async increaseWallet(userId: string, amount: string | number) {
    try {
      let wallet = undefined;
      wallet = await this.wallet.findOneAndUpdate(
        { userId },
        {
          $inc: {
            balance: Number(amount).toFixed(2),
          },
        },
        { new: true },
      );
      return wallet;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
  async decreaseWallet(userId: string, amount: string | number) {
    try {
      let wallet = undefined;
      wallet = await this.wallet.findOneAndUpdate(
        { userId },
        {
          $inc: {
            balance: -Number(amount).toFixed(2),
          },
        },
        { new: true },
      );
      return wallet;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  //FL payment response
  async paymentresponse(transaction_id: string | number, description: string) {
    try {
      const flw = new Flutterwave(
        'FLWPUBK-24b4db4ba5c49a5e48daac3eabcd563b-X',
        `${process.env.FLUTTERWAVE_V3_SECRET_KEY}`,
      );
      const response = await flw.Transaction.verify({
        id: `${transaction_id}`,
      });
      const { status, id, amount, customer, tx_ref, narration } = response.data;
      const transactionExists = await this.transaction.findOne({
        transactionId: id,
      });
      if (transactionExists) {
        throw new ForbiddenException({ msg: 'Transaction already exists' });
      }
      const user = await this.User.findOne({ email: customer?.email });
      if (!user) {
        throw new UnauthorizedException({
          msg: 'Unathorized Access. Something went wrong. Please contact customer care.',
        });
      }

      await this.validateUserWallet(user?._id);

      await this.createWalletTransactions(
        user._id,
        status,
        amount,
        description,
        narration,
      );

      await this.createTransaction(
        user._id,
        id,
        status,
        amount,
        customer,
        tx_ref,
        description,
        narration,
      );

      const wallet = await this.increaseWallet(user._id, amount);

      return { msg: 'Wallet funded successfully', balance: wallet };
    } catch (err) {
      throw new InternalServerErrorException({
        msg: 'Something went wrong',
        log: err.message,
      });
    }
  }
  //paystack payment response
  async payStackPaymentResponse(
    responseObject: {
      reference: string;
      status: string;
      transactionId: string;
      trxref: string;
    },
    res: Response,
  ) {
    try {
      const url = `https://api.paystack.co/transaction/verify/${responseObject?.reference}`;
      const options = {
        method: 'GET',
        url,
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'content-type': 'application/json',
          'cache-control': 'no-cache',
        },
        json: true,
      };

      request(options, async (error: any, response: any) => {
        if (error) {
          return res
            .status(400)
            .json({ msg: `Something went wrong with Paystack's API` });
        }
        // console.log(response?.body);
        try {
          const result = response?.body;
          if (result.status === 'error') {
            return res.status(400).json({
              msg: 'No bank is found for this particular country code',
            });
          }
          if (result.data.status === 'success') {
            const { id, status, amount, reference, customer } = result?.data;
            const { userId, userName, phonenumber } = result?.data?.metadata;

            await this.validateUserWallet(userId);
            await this.createWalletTransactions(
              userId,
              status,
              amount,
              'wallet increase',
              `${userName} funded their wallet`,
            );

            await this.createTransaction(
              userId,
              id,
              status,
              amount,
              {
                name: userName,
                email: customer?.email,
                phone_number: phonenumber,
              },
              reference,
              'wallet increase',
              `${userName} funded their wallet`,
            );
            const wallet = await this.increaseWallet(
              userId,
              Number(amount / 100),
            );

            return res.status(200).json({ msg: 'success', payload: wallet });
          }
        } catch (err) {
          return res.status(500).json({ msg: err.message });
        }
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
  //INAPP
  async getUserBalance(userId: string, res: Response) {
    try {
      let result = await this.validateUserWallet(userId);

      return res.status(200).json({ msg: 'success', payload: result });
    } catch (err) {
      return res.status(500).json({
        msg: 'Something went wrong',
        log: err.message,
      });
    }
  }
  //INAPP
  async chargeWallet(userId: string, amount: number, res: Response) {
    try {
      //fetch user. Some propeties needed for other database calls below
      const user = await this.User.findOne({ _id: userId });
      if (!user) {
        return res.status(400).json({ msg: 'Bad request. User not found' });
      }

      //check if user has a wallet. If not, create one.
      await this.validateUserWallet(userId);

      //check if user has enough funds in their wallet
      const userWallet = await this.wallet.findOne({ userId });
      if (Number(userWallet.balance) < Number(amount)) {
        return res.status(400).json({
          msg: `You do not have up to NGN ${amount}. Please fund your wallet and try again`,
        });
      }
      //create wallet trascation records
      await this.createWalletTransactions(
        userId,
        'success',
        amount,
        'wallet decrease',
        `Inapp purchase`,
      );

      //create a more elaborate transaction record
      await this.createTransaction(
        userId,
        String(Date.now() + (Math.random() * 10 ** 5).toFixed(0)),
        'success',
        amount,
        {
          name: `${user?.firstName} ${user?.lastName}`,
          email: user?.email,
          phone_number: user?.phoneNumber,
        },
        (Math.random() * 10 ** 10).toFixed(0),
        'wallet increase',
        `${user?.firstName} ${user?.lastName} funded their wallet`,
      );

      //charge the wallet
      const result = await this.decreaseWallet(userId, amount);
      if (result) {
        return res.status(200).json({ msg: 'success', payload: result });
      } else {
        return res
          .status(400)
          .json({ msg: 'Something went wrong. Please try again' });
      }
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  //IN APP
  async latestTransactions(userId: string | number) {
    try {
      const lastTen = await this.wallettransaction
        .find({ userId })
        .limit(15)
        .sort('-createdAt');
      if (lastTen.length === 0)
        throw new NotFoundException({ msg: 'No Transactions present' });
      else return { msg: 'success', latestTransactions: lastTen };
    } catch (err) {
      throw new InternalServerErrorException({
        msg: 'Something went wrong',
        log: err.message,
      });
    }
  }
}
