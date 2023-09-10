import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { cardDetailsDTO } from 'src/flashcard/flashcards.dto';
import {
  essayBodyDTO,
  essayDetailsDTO,
  essayIdDTO,
} from 'src/essays/essays.dto';
import { jwtIsValid } from 'src/utils';
import { Request, Response } from 'express';

@Injectable()
export class EssaysService {
  constructor(@InjectModel('essays') private readonly essay: Model<any>) {}
  async createEssay(
    details: cardDetailsDTO,
    essayBody: essayBodyDTO,
    req: Request,
    res: Response,
  ) {
    try {
      const { scenarios, QAs } = essayBody;
      const decoded = await jwtIsValid(req?.signedCookies?.accessToken);
      const essay = await this.essay.create({
        creatorId: decoded?._id,
        details,
        scenarios,
        QAs,
      });
      return res.status(201).json({ msg: 'success', payload: essay });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async getEssay(essayId: essayIdDTO, res: Response) {
    try {
      const essay = await this.essay
        .findOne({ _id: essayId })
        .select('details _id scenarios QAs');
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
    essayId: essayIdDTO,
    details: essayDetailsDTO,
    essayBody: essayBodyDTO,
    req: Request,
    res: Response,
  ) {
    try {
      const decoded = await jwtIsValid(req?.signedCookies?.accessToken);
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
            },
          },
          { new: true },
        )
        .select('details _id scenarios QAs');
      return res.status(200).json({ msg: 'success', payload: mcq });
    } catch (err) {
      res.status(500).json({ msg: err?.message });
    }
  }
  async deleteEssay(essayId: essayIdDTO, req: Request, res: Response) {
    try {
      const deleteEssay = await this.essay.findOneAndDelete(
        { _id: essayId },
        { new: true },
      );
      if (!deleteEssay) {
        return res
          .status(400)
          .json({ msg: 'This mcq never existed or has been deleted' });
      }
      return this.getAllEssays(req, res);
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
}
