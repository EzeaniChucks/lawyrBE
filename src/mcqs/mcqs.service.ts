import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request, Response } from 'express';
import { Model } from 'mongoose';
import {
  cardDetailsDTO,
  cardIdDTO,
  cardQAPairDTO,
} from 'src/flashcard/flashcards.dto';
import { jwtIsValid } from 'src/utils';
import { MCQBodyDTO } from './mcqs.dto';

@Injectable()
export class McqsService {
  constructor(@InjectModel('mcqs') private readonly mcqs: Model<any>) {}
  async createFlashCard(
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
  async getFlashCard(cardId: cardIdDTO, res: Response) {
    try {
      const flashcard = await this.mcqs.findOne({ _id: cardId });
      return res.status(200).json({ msg: 'success', payload: flashcard });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async getAllFlashCards(req: Request, res: Response) {
    try {
      //get userId from cookies
      // const flashcard = await this.mcqs.findOne({ creatorId: userId });
      const flashcard = await this.mcqs
        .find()
        .select('details _id createdAt updatedAt');
      return res.status(200).json({ msg: 'success', payload: flashcard });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async updateFlashCard(
    flashcardId: cardIdDTO,
    details: cardDetailsDTO,
    qaPair: cardQAPairDTO[],
    req: Request,
    res: Response,
  ) {
    try {
      const decoded = await jwtIsValid(req?.signedCookies?.accessToken);
      const getflashcardId = await this.mcqs.findOne({
        _id: flashcardId,
      });
      if (decoded._id !== getflashcardId.creatorId.toString()) {
        res.status(400).json({
          msg: 'This flashcard is not yours. You can not perform this action.',
        });
      }
      const flashcard = await this.mcqs.findOneAndUpdate(
        { _id: flashcardId },
        { $set: { details, qaPair } },
        { new: true },
      );
      return res.status(200).json({ msg: 'success', payload: flashcard });
    } catch (err) {
      res.status(500).json({ msg: err?.message });
    }
  }
  async deleteFlashCard(flashcardId: cardIdDTO, req: Request, res: Response) {
    try {
      const deleteflashcard = await this.mcqs.findOneAndDelete(
        { _id: flashcardId },
        { new: true },
      );
      if (!deleteflashcard) {
        return res
          .status(400)
          .json({ msg: 'This flashcard never existed or has been deleted' });
      }
      return this.getAllFlashCards(req, res);
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
}
