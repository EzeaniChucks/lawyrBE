import {
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Response } from 'express';
import { Model } from 'mongoose';
import * as emailjs from '@emailjs/nodejs';

export const createJwt = async (body: {
  _id: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  isSubAdmin: boolean;
}) => {
  try {
    const token = await jwt.sign(body, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_LIFETIME,
    });
    return token;
  } catch (err) {
    throw new InternalServerErrorException({ msg: err.message });
  }
};
export const jwtIsValid = async (token: string) => {
  try {
    if (!token) {
      throw new ForbiddenException('forbidden request');
    }
    const isValid = await jwt.verify(token, process.env.JWT_SECRET);
    if (isValid) {
      return isValid;
    } else {
      throw new ForbiddenException('forbidden request');
    }
  } catch (err) {
    throw new InternalServerErrorException({ msg: err.message });
  }
};

export const attachCookiesToResponse = async (
  res: Response,
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    isAdmin: boolean;
    isSubAdmin: boolean;
    assets: [{ subscriptions: []; purchases: []; cart: [] }];
  },
) => {
  const token = await createJwt(user);
  const oneDay = 1000 * 60 * 60 * 24;
  res.cookie('accessToken', token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
};
// const contents = mongoose.model('contents', contentsSchema);
export const canDeleteResource = async (
  resource: any,
  resourceId: any,
  contents: Model<any>,
) => {
  const result = await resource.findOne({ _id: resourceId });
  try {
    if (result) {
      if (result?.parentIds?.length !== 0) {
        const contentName = await contents.findOne({
          _id: result?.parentIds[0],
        });
        return { payload: false, extra: contentName?.name };
      } else {
        return { payload: true, extra: '' };
      }
    }
  } catch (err) {
    return { payload: err.message, extra: '' };
  }
};

export const sendEmail = async (
  user: { firstName: string; lastName: string; email: string },
  message: string,
) => {
  return await emailjs.send(
    process.env.EmailServiceId,
    process.env.EmailTemplateId,
    {
      name: `${user?.firstName} ${user?.lastName}`,
      email: `${user?.email}`,
      message,
    },
    {
      publicKey: process.env.EmailPubKey,
      privateKey: process.env.EmailPriKey,
    },
  );
};

export const TransactionDescriptions = {
  paystack: {
    credit: 'Inapp wallet top-up',
    debit: 'Inapp wallet debit',
  },
  flutterwave: {
    credit: 'Inapp wallet top-up',
    debit: 'Inapp wallet debit',
  },
  inapp: {
    debit: 'Inapp debit',
    credit: 'Inapp credit',
  },
};