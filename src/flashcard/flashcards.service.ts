import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { cardDetailsDTO, cardIdDTO, cardQAPairDTO } from './flashcards.dto';
import { canDeleteResource, jwtIsValid } from 'src/utils';
import { Request, Response } from 'express';
@Injectable()
export class FlashCardsService {
  constructor(
    @InjectModel('flashcards') private readonly flashcards: Model<any>,
    @InjectModel('contents') private readonly contents: Model<any>,
  ) {}
  async createFlashCard(
    details: cardDetailsDTO,
    qaPair: cardQAPairDTO[],
    req: Request,
    res: Response,
  ) {
    try {
      const decoded = await jwtIsValid(req?.headers?.authorization?.split(' ')[1]);
      const flashcard = await this.flashcards.create({
        details,
        qaPair,
        creatorId: decoded?._id,
      });
      return res.status(201).json({ msg: 'success', payload: flashcard });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async getFlashCard(cardId: string, res: Response) {
    try {
      const flashcard = await this.flashcards.findOne({ _id: cardId });
      return res.status(200).json({ msg: 'success', payload: flashcard });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async getAllFlashCards(req: Request, res: Response) {
    try {
      //get userId from cookies
      // const flashcard = await this.flashcards.findOne({ creatorId: userId });
      const flashcard = await this.flashcards
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
      const decoded = await jwtIsValid(req?.headers?.authorization?.split(' ')[1]);
      const getflashcardId = await this.flashcards.findOne({
        _id: flashcardId,
      });
      if (decoded._id !== getflashcardId.creatorId.toString()) {
        res.status(400).json({
          msg: 'This flashcard is not yours. You can not perform this action.',
        });
      }
      const flashcard = await this.flashcards.findOneAndUpdate(
        { _id: flashcardId },
        { $set: { details, qaPair } },
        { new: true },
      );
      return res.status(200).json({ msg: 'success', payload: flashcard });
    } catch (err) {
      res.status(500).json({ msg: err?.message });
    }
  }
  async deleteFlashCard(flashcardId: string, req: Request, res: Response) {
    try {
      const canDelete = await canDeleteResource(
        this.flashcards,
        flashcardId,
        this.contents,
      );
      if (!canDelete?.payload) {
        return res.status(400).json({
          msg: `This resource belongs to superFolder ${canDelete?.extra}. You can edit the resource but deletion is not possible. Remove resource from '${canDelete?.extra}' to enable deletion.`,
        });
      } else if (typeof canDelete?.payload === 'string') {
        return res.status(400).json({ msg: canDelete });
      }
      const deleteflashcard = await this.flashcards.findOneAndDelete(
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
