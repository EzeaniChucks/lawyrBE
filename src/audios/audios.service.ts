import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request, Response } from 'express';
import { Model } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.services';
import { AudioDetailsDTO } from './audios.dto';
import { jwtIsValid } from 'src/utils';
import { fork } from 'child_process';
import { File } from 'buffer';

@Injectable()
export class AudiosService {
  constructor(
    @InjectModel('audios') private readonly audios: Model<any>,
    private readonly cloudinaryservice: CloudinaryService,
  ) {}
  // private childProcess: ChildProcess;
  generateSecureAudioURl(audioPublicId: string) {
    const options = {
      resource_type: 'audio',
      type: 'authenticated',
      secure: true,
      // expiration_time
    };
    return this.cloudinaryservice.urlAudio(audioPublicId, options);
  }
  async uploadAudio(
    audiofile: File,
    parentId: string,
    details: AudioDetailsDTO,
    name: string,
    audioActionType: string,
    req: Request,
    res: Response,
  ) {
    try {
      const cookieObj = await jwtIsValid(req?.signedCookies?.accessToken);
      const creatorId = cookieObj._id;
      if (cookieObj?.isAdmin !== true) {
        return res.status(400).json({ msg: 'Forbidden request' });
      }
      if (audioActionType === 'create') {
        const result = await this.cloudinaryservice.uploadAudio(audiofile);
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
        const audio = await this.audios.create({
          creatorId,
          details,
          audios: [
            {
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
          ],
        });
        if (!audio) {
          return res
            .status(400)
            .json({ msg: 'Something went wronf creating audio' });
        }
        const childProcess = fork('./src/child.js');
        let promise = new Promise<any>((resolve, reject) => {
          childProcess.on('message', (receivedvids) => {
            resolve(receivedvids);
          });
          childProcess.on('exit', (code, signal) => {
            console.log(code, signal);
          });
          childProcess.send(audio.audios);
        });
        let response = await promise;
        return res.status(200).json({
          payload: {
            _id: audio._id,
            details,
            audios: response,
          },
        });
      } else if (audioActionType === 'update') {
        const result = await this.cloudinaryservice.uploadAudio(audiofile);
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
        const audios = await this.audios.findOneAndUpdate(
          { _id: parentId },
          {
            $push: {
              audios: {
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
        const childProcess = fork('./src/child.js');
        let promise = new Promise<any>((resolve, reject) => {
          childProcess.on('message', (receivedvids) => {
            resolve(receivedvids);
          });
          childProcess.on('exit', (code, signal) => {
            throw new BadGatewayException({
              msg: 'something went wrong receing message from child process',
              code,
              signal,
            });
          });
          childProcess.send(audios.audios);
        });
        let response = await promise;
        return res.status(200).json({
          payload: {
            _id: audios._id,
            details,
            audios: response,
          },
        });
      }
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
    // newevent.eventImageName = result.secure_url;
  }
  async getAllAudioGroups() {
    try {
      const allaudioGroups = await this.audios
        .find()
        .select('_id details createdAt updatedAt');
      return { payload: allaudioGroups };
    } catch (err) {
      throw new InternalServerErrorException({ msg: err?.message });
    }
  }
  async getSingleAudioGroup(audioId: string) {
    try {
      const singleaudioGroup = await this.audios
        .findOne({ _id: audioId })
        .select('_id details audios');
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
        childProcess.send(singleaudioGroup?.audios);
      });
      return {
        payload: {
          _id: singleaudioGroup._id,
          details: singleaudioGroup.details,
          audios: await promise,
        },
      };
    } catch (err) {
      throw new InternalServerErrorException({ msg: err?.message });
    }
  }
  async replaceSingleAudio({
    audiofile,
    name,
    parentId,
    oldAudioId,
    res,
  }: {
    audiofile: File;
    name: string;
    parentId: string;
    oldAudioId: string;
    res: Response;
  }) {
    try {
      const singleAudioObject = await this.audios.findOne(
        {
          _id: parentId,
          audios: { $elemMatch: { _id: oldAudioId } },
        },
        {
          _id: parentId,
          audios: { $elemMatch: { _id: oldAudioId } },
        },
      );
      if (!singleAudioObject) {
        return res.status(200).json({
          msg: 'audio no longer exists. Check to see if it has not been deleted',
        });
      }
      const publicaudioId = singleAudioObject?.audios[0].public_id;
      await this.cloudinaryservice.destroyAudio(publicaudioId);
      const result = await this.cloudinaryservice.uploadAudio(audiofile);
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
      await this.audios.findOneAndUpdate(
        { _id: parentId },
        {
          $push: {
            audios: {
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
      const audios = await this.audios.findOneAndUpdate(
        { _id: parentId },
        {
          $pull: {
            audios: { _id: oldAudioId },
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
        childProcess.send(audios.audios);
      });
      let response = await promise;
      return res.status(200).json({
        payload: {
          _id: audios?._id,
          details: audios?.details,
          audios: response,
        },
      });
    } catch (err) {
      return res.status(500).json(err.message);
    }
  }
  async editSingleAudioName({
    name,
    parentId,
    singleAudioId,
    res,
  }: {
    name: string;
    parentId: string;
    singleAudioId: string;
    res: Response;
  }) {
    try {
      const audios = await this.audios.findOneAndUpdate(
        { _id: parentId, 'audios._id': singleAudioId },
        { $set: { 'audios.$.name': name } },
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
        childProcess.send(audios.audios);
      });
      let response = await promise;
      return res.status(200).json({
        payload: {
          _id: audios?._id,
          details: audios?.details,
          audios: response,
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async editAudioDetails({
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
      const audios = await this.audios.findOneAndUpdate(
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
        childProcess.send(audios.audios);
      });
      let response = await promise;
      return res.status(200).json({
        payload: {
          _id: audios?._id,
          details: audios?.details,
          audios: response,
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async deleteSingleAudio({
    parentId,
    audioId,
    res,
  }: {
    parentId: string;
    audioId: string;
    res: Response;
  }) {
    try {
      const singleAudioObject = await this.audios.findOne(
        {
          _id: parentId,
          audios: { $elemMatch: { _id: audioId } },
        },
        {
          _id: parentId,
          audios: { $elemMatch: { _id: audioId } },
        },
      );
      if (!singleAudioObject) {
        return res.status(200).json({
          msg: 'audio no longer exists. Check to see if it has not been deleted',
        });
      }
      const publicaudioId = singleAudioObject?.audios[0].public_id;

      await this.cloudinaryservice.destroyAudio(publicaudioId);
      const audios = await this.audios.findOneAndUpdate(
        { _id: parentId },
        {
          $pull: {
            audios: { _id: audioId },
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
        childProcess.send(audios.audios);
      });
      let response = await promise;
      return res.status(200).json({
        payload: {
          _id: audios?._id,
          details: audios?.details,
          audios: response,
        },
      });
    } catch (err) {
      res.status(500).json({ msg: err?.message });
    }
  }
  async deleteEntireAudioGroups({
    parentaudioId,
    res,
  }: {
    parentaudioId: string;
    res: Response;
  }) {
    try {
      const audioGroup = await this.audios.findOne({ _id: parentaudioId });
      const audioPublicIds: string[] = audioGroup.audios.map(
        (eachaudio: any) => {
          return eachaudio?.public_id;
        },
      );

      await this.cloudinaryservice.destroyMultipleAudios(audioPublicIds);

      await this.audios.findOneAndDelete({ _id: parentaudioId }, { new: true });
      const allaudioGroups = await this.audios
        .find()
        .select('_id details createdAt updatedAt');
      return res.status(200).json({ payload: allaudioGroups });
    } catch (err) {
      return res.status(500).json(err?.message);
    }
  }
}
