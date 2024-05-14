import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Docx_pdfDetailsDTO } from './books.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.services';
import { canDeleteResource, jwtIsValid } from 'src/utils';
import { fork } from 'child_process';
import { File } from 'buffer';

@Injectable()
export class Docx_pdfsService {
  constructor(
    @InjectModel('docxpdfs') private readonly docx_pdf: Model<any>,
    @InjectModel('contents') private readonly contents: Model<any>,
    private readonly cloudinaryservice: CloudinaryService,
  ) {}
  // private childProcess: ChildProcess;
  generateSecureDocx_pdfURl(docx_pdfPublicId: string) {
    const options = {
      resource_type: 'docx_pdf',
      type: 'authenticated',
      secure: true,
      // expiration_time
    };
    return this.cloudinaryservice.urlPdf(docx_pdfPublicId, options);
  }
  async uploadDocx_pdf(
    docx_pdffile: any,
    details: Docx_pdfDetailsDTO,
    req: Request,
    res: Response,
  ) {
    try {
      const cookieObj = await jwtIsValid(req?.headers?.authorization?.split(' ')[1]);
      const creatorId = cookieObj._id;
      if (cookieObj?.isAdmin !== true) {
        return res.status(400).json({ msg: 'Forbidden request' });
      }
      const result = await this.cloudinaryservice.uploadPdf(docx_pdffile);
      // console.log('mimetype', docx_pdffile?.mimetype, 'result', result);
      const {
        secure_url,
        public_id,
        asset_id,
        version,
        version_id,
        signature,
        pages,
        width,
        height,
        resource_type,
        format,
      } = result;

      const docx_pdf = await this.docx_pdf.create({
        creatorId,
        details,
        docx_pdfs: [
          {
            secure_url,
            public_id,
            asset_id,
            version,
            version_id,
            pages,
            width,
            height,
            resource_type,
            format,
            signature,
          },
        ],
        docType: format,
      });
      if (!docx_pdf) {
        return res
          .status(400)
          .json({ msg: 'Something went wronf creating docx_pdf' });
      }
      const childProcess = fork('./src/child.js');
      let promise = new Promise<any>((resolve, reject) => {
        childProcess.on('message', (receivedvids) => {
          resolve(receivedvids);
        });
        childProcess.on('exit', (code, signal) => {
          console.log(code, signal);
        });
        docx_pdf.docx_pdfs[0]['name'] = '';
        childProcess.send([...docx_pdf.docx_pdfs]);
      });
      let response = await promise;
      response[0].pages = pages;
      response[0].docType = resource_type;
      return res.status(200).json({
        payload: {
          _id: docx_pdf._id,
          details,
          docx_pdfs: response,
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
    // newevent.eventImageName = result.secure_url;
  }
  async getAllDocx_pdfs() {
    try {
      const alldocx_pdfs = await this.docx_pdf
        .find()
        .select('_id details docType createdAt updatedAt');
      return { payload: alldocx_pdfs };
    } catch (err) {
      throw new InternalServerErrorException({ msg: err?.message });
    }
  }
  async getSingleDocx_pdf(docx_pdfId: string) {
    try {
      const singledocx_pdf = await this.docx_pdf
        .findOne({ _id: docx_pdfId })
        .select('_id details docx_pdfs docType');
      if (!singledocx_pdf) {
        throw new NotFoundException({ msg: 'Document does not exist' });
      }
      const pages = singledocx_pdf?.docx_pdfs[0].pages;
      const format = singledocx_pdf?.docx_pdfs[0].format;
      const childProcess = fork('./src/child.js');
      const promise = new Promise((resolve, reject) => {
        childProcess.on('message', (videArr: any) => {
          resolve(videArr);
        });
        childProcess.on('exit', (code, signal) => {
          throw new BadGatewayException({
            msg: 'something went wrong receing message from child process',
            code,
            signal,
          });
        });
        singledocx_pdf.docx_pdfs[0]['name'] = '';
        childProcess.send(singledocx_pdf?.docx_pdfs);
      });
      let response = await promise;
      response[0].pages = pages;
      response[0].docType = format;
      return {
        payload: {
          _id: singledocx_pdf._id,
          details: singledocx_pdf.details,
          docx_pdfs: await promise,
        },
      };
    } catch (err) {
      throw new InternalServerErrorException({ msg: err?.message });
    }
  }
  async replaceSingleDocx_pdf({
    docx_pdffile,
    name,
    parentId,
    olddocx_pdfId,
    res,
  }: {
    docx_pdffile: File;
    name: string;
    parentId: string;
    olddocx_pdfId: string;
    res: Response;
  }) {
    try {
      const singledocx_pdfObject = await this.docx_pdf.findOne(
        {
          _id: parentId,
          docx_pdf: { $elemMatch: { _id: olddocx_pdfId } },
        },
        {
          _id: parentId,
          docx_pdf: { $elemMatch: { _id: olddocx_pdfId } },
        },
      );
      if (!singledocx_pdfObject) {
        return res.status(200).json({
          msg: 'docx_pdf no longer exists. Check to see if it has not been deleted',
        });
      }
      const publicdocx_pdfId = singledocx_pdfObject?.docx_pdf[0].public_id;
      await this.cloudinaryservice.destroyPdf(publicdocx_pdfId);
      const result = await this.cloudinaryservice.uploadPdf(docx_pdffile);
      const {
        secure_url,
        playback_url,
        public_id,
        asset_id,
        version,
        version_id,
        signature,
        resource_type,
        format,
      } = result;
      await this.docx_pdf.findOneAndUpdate(
        { _id: parentId },
        {
          $push: {
            docx_pdf: {
              name,
              secure_url,
              playback_url,
              public_id,
              asset_id,
              version,
              version_id,
              resource_type,
              format,
              signature,
            },
          },
        },
        { new: true },
      );
      const docx_pdf = await this.docx_pdf.findOneAndUpdate(
        { _id: parentId },
        {
          $pull: {
            docx_pdf: { _id: olddocx_pdfId },
          },
        },
        { new: true },
      );
      const childProcess = fork('./src/child.js');
      let promise = new Promise<any>((resolve, reject) => {
        childProcess.on('message', (receivedvids) => {
          resolve(receivedvids);
        });
        childProcess.on('exit', (code, signal) => {
          return res.status(400).json({
            msg: 'something went wrong receing message from child process',
            code,
            signal,
          });
        });
        childProcess.send(docx_pdf.docx_pdf);
      });
      let response = await promise;
      return res.status(200).json({
        payload: {
          _id: docx_pdf?._id,
          details: docx_pdf?.details,
          docx_pdf: response,
        },
      });
    } catch (err) {
      return res.status(500).json(err.message);
    }
  }
  async editSingleDocx_pdfName({
    name,
    parentId,
    singledocx_pdfId,
    res,
  }: {
    name: string;
    parentId: string;
    singledocx_pdfId: string;
    res: Response;
  }) {
    try {
      const docx_pdf = await this.docx_pdf.findOneAndUpdate(
        { _id: parentId, 'docx_pdf._id': singledocx_pdfId },
        { $set: { 'docx_pdf.$.name': name } },
        { new: true },
      );
      const childProcess = fork('./src/child.js');
      let promise = new Promise<any>((resolve, reject) => {
        childProcess.on('message', (receivedvids) => {
          resolve(receivedvids);
        });
        childProcess.on('exit', (code, signal) => {
          return res.status(400).json({
            msg: 'something went wrong receing message from child process',
            code,
            signal,
          });
        });
        childProcess.send(docx_pdf.docx_pdf);
      });
      let response = await promise;
      return res.status(200).json({
        payload: {
          _id: docx_pdf?._id,
          details: docx_pdf?.details,
          docx_pdf: response,
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async editDocx_pdfDetails({
    title,
    description,
    parentId,
    res,
  }: {
    title: string;
    parentId: string;
    description: string;
    res: Response;
  }) {
    try {
      const docx_pdf = await this.docx_pdf.findOneAndUpdate(
        { _id: parentId },
        { $set: { details: { title, description } } },
        { new: true },
      );
      const childProcess = fork('./src/child.js');
      let promise = new Promise<any>((resolve, reject) => {
        childProcess.on('message', (receivedvids) => {
          resolve(receivedvids);
        });
        childProcess.on('exit', (code, signal) => {
          return res.status(400).json({
            msg: 'something went wrong receing message from child process',
            code,
            signal,
          });
        });
        childProcess.send(docx_pdf.docx_pdf);
      });
      let response = await promise;
      return res.status(200).json({
        payload: {
          _id: docx_pdf?._id,
          details: docx_pdf?.details,
          docx_pdf: response,
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async deleteSingleDocx_pdf({
    parentId,
    docx_pdfId,
    res,
  }: {
    parentId: string;
    docx_pdfId: string;
    res: Response;
  }) {
    try {
      const canDelete = await canDeleteResource(
        this.docx_pdf,
        docx_pdfId,
        this.contents,
      );
      if (!canDelete?.payload) {
        return res.status(400).json({
          msg: `This resource belongs to superFolder ${canDelete?.extra}. You can edit the resource but deletion is not possible. Remove resource from '${canDelete?.extra}' to enable deletion.`,
        });
      } else if (typeof canDelete?.payload === 'string') {
        return res.status(400).json({ msg: canDelete });
      }
      const singledocx_pdfObject = await this.docx_pdf.findOne(
        {
          _id: parentId,
          docx_pdf: { $elemMatch: { _id: docx_pdfId } },
        },
        {
          _id: parentId,
          docx_pdf: { $elemMatch: { _id: docx_pdfId } },
        },
      );
      if (!singledocx_pdfObject) {
        return res.status(200).json({
          msg: 'docx_pdf no longer exists. Check to see if it has not been deleted',
        });
      }
      const publicdocx_pdfId = singledocx_pdfObject?.docx_pdf[0].public_id;

      await this.cloudinaryservice.destroyPdf(publicdocx_pdfId);
      const docx_pdf = await this.docx_pdf.findOneAndUpdate(
        { _id: parentId },
        {
          $pull: {
            docx_pdf: { _id: docx_pdfId },
          },
        },
        { new: true },
      );
      const childProcess = fork('./src/child.js');
      let promise = new Promise<any>((resolve, reject) => {
        childProcess.on('message', (receivedvids) => {
          resolve(receivedvids);
        });
        childProcess.on('exit', (code, signal) => {
          return res.status(400).json({
            msg: 'something went wrong receing message from child process',
            code,
            signal,
          });
        });
        childProcess.send(docx_pdf.docx_pdf);
      });
      let response = await promise;
      return res.status(200).json({
        payload: {
          _id: docx_pdf?._id,
          details: docx_pdf?.details,
          docx_pdf: response,
        },
      });
    } catch (err) {
      res.status(500).json({ msg: err?.message });
    }
  }
  //   async deleteEntireDocx_pdfs({
  //     parentdocx_pdfId,
  //     res,
  //   }: {
  //     parentdocx_pdfId: string;
  //     res: Response;
  //   }) {
  //     try {
  //       const docx_pdf = await this.docx_pdf.findOne({ _id: parentdocx_pdfId });
  //       const docx_pdfPublicIds: string[] = docx_pdf.docx_pdf.map(
  //         (eachdocx_pdf: any) => {
  //           return eachdocx_pdf?.public_id;
  //         },
  //       );

  //       await this.cloudinaryservice.destroyMultipledfs(docx_pdfPublicIds);

  //       await this.docx_pdf.findOneAndDelete({ _id: parentdocx_pdfId }, { new: true });
  //       const alldocx_pdfs = await this.docx_pdf
  //         .find()
  //         .select('_id details createdAt updatedAt');
  //       return res.status(200).json({ payload: alldocx_pdfs });
  //     } catch (err) {
  //       return res.status(500).json(err?.message);
  //     }
  //   }
}
