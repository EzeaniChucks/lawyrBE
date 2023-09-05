import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Response } from 'express';

export const createJwt = async (body: {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isAdmin: string;
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
    phoneNumber: string;
    isAdmin: string;
  },
) => {
  const token = await createJwt(user);
  const oneDay = 1000 * 60 * 60 * 24;
  res.cookie('accessToken', token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production',
    signed: true,
  });
};
