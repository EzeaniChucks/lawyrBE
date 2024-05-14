import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { cardDetailsDTO } from 'src/flashcard/flashcards.dto';
import {
  essayBodyDTO,
  essayDetailsDTO,
  essayIdDTO,
} from 'src/essays/essays.dto';
import { canDeleteResource, jwtIsValid } from 'src/utils';
import { Request, Response } from 'express';

@Injectable()
export class EssaysService {
  constructor(
    @InjectModel('essays') private readonly essay: Model<any>,
    @InjectModel('contents') private readonly contents: Model<any>,
  ) {}
  async createEssay(
    details: cardDetailsDTO,
    essayBody: essayBodyDTO,
    req: Request,
    res: Response,
  ) {
    try {
      const { scenarios, QAs, QAview } = essayBody;
      const decoded = await jwtIsValid(
        req?.headers?.authorization?.split(' ')[1],
      );
      const essay = await this.essay.create({
        creatorId: decoded?._id,
        details,
        scenarios,
        QAs,
        QAview,
      });
      return res.status(201).json({ msg: 'success', payload: essay });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async getEssay(essayId: string, res: Response) {
    try {
      const essay = await this.essay
        .findOne({ _id: essayId })
        .select('details _id scenarios QAs QAview');
      return res.status(200).json({ msg: 'success', payload: essay || {} });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async getAllEssays(req: Request, res: Response) {
    try {
      const essay = await this.essay
        .find()
        .select('details _id createdAt updatedAt');
      return res.status(200).json({ msg: 'success', payload: essay || [] });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async updateEssay(
    essayId: string,
    details: essayDetailsDTO,
    essayBody: essayBodyDTO,
    req: Request,
    res: Response,
  ) {
    try {
      const decoded = await jwtIsValid(
        req?.headers?.authorization?.split(' ')[1],
      );
      const confirmMCQCreator = await this.essay.findOne({
        _id: essayId,
      });
      if (decoded._id !== confirmMCQCreator.creatorId.toString()) {
        res.status(400).json({
          msg: 'You can not perform this action.',
        });
      }
      const mcq = await this.essay
        .findOneAndUpdate(
          { _id: essayId },
          {
            $set: {
              details,
              scenarios: essayBody?.scenarios,
              QAs: essayBody?.QAs,
              QAview: essayBody?.QAview || 'horizontal',
            },
          },
          { new: true },
        )
        .select('details _id scenarios QAs QAview');
      return res.status(200).json({ msg: 'success', payload: mcq });
    } catch (err) {
      res.status(500).json({ msg: err?.message });
    }
  }
  async deleteEssay(essayId: essayIdDTO, req: Request, res: Response) {
    try {
      const canDelete = await canDeleteResource(
        this.essay,
        essayId,
        this.contents,
      );
      if (!canDelete?.payload) {
        return res.status(400).json({
          msg: `This resource belongs to superFolder ${canDelete?.extra}. You can edit the resource but deletion is not possible. Remove resource from '${canDelete?.extra}' to enable deletion.`,
        });
      } else if (typeof canDelete?.payload === 'string') {
        return res.status(400).json({ msg: canDelete });
      }
      const deleteEssay = await this.essay.findOneAndDelete(
        { _id: essayId },
        { new: true },
      );
      if (!deleteEssay) {
        return res
          .status(400)
          .json({ msg: 'This essay never existed or has been deleted' });
      }
      return this.getAllEssays(req, res);
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
}
