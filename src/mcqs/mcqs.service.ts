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

@Injectable()
export class McqsService {
  constructor(
    @InjectModel('mcqs') private readonly mcqs: Model<any>,
    @InjectModel('contents') private readonly contents: Model<any>,
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
}
