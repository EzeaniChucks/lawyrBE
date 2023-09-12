import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.services';
import { VideoDetailsDTO } from './videos.dto';
import { ChildProcess, fork } from 'child_process';
import { Request, Response } from 'express';
import { jwtIsValid } from 'src/utils';
import { File } from 'buffer';

@Injectable()
export class VideosService {
  constructor(
    @InjectModel('videos') private readonly videos: Model<any>,
    private readonly cloudinaryservice: CloudinaryService,
  ) {}
  // private childProcess: ChildProcess;
  generateSecureVideoURl(videoPublicId: string) {
    const options = {
      resource_type: 'video',
      type: 'authenticated',
      secure: true,
      // expiration_time
    };
    return this.cloudinaryservice.url(videoPublicId, options);
  }

  async uploadVideo(
    videofile: any,
    parentId: string,
    details: VideoDetailsDTO,
    name: string,
    videoActionType: string,
    req: Request,
    res: Response,
  ) {
    try {
      const cookieObj = await jwtIsValid(req?.signedCookies?.accessToken);
      const creatorId = cookieObj._id;
      if (cookieObj?.isAdmin !== true) {
        return res.status(400).json({ msg: 'Forbidden request' });
      }
      if (videoActionType === 'create') {
        const result = await this.cloudinaryservice.uploadVideo(videofile);
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
        const video = await this.videos.create({
          creatorId,
          details,
          videos: [
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
        if (!video) {
          return res
            .status(400)
            .json({ msg: 'Something went wronf creating video' });
        }
        const childProcess = fork('./src/child.js');
        let promise = new Promise<any>((resolve, reject) => {
          childProcess.on('message', (receivedvids) => {
            resolve(receivedvids);
          });
          childProcess.on('exit', (code, signal) => {
            console.log(code, signal);
          });
          childProcess.send(video.videos);
        });
        let response = await promise;
        return res.status(200).json({
          payload: {
            _id: video._id,
            details,
            videos: response,
          },
        });
      } else if (videoActionType === 'update') {
        const result = await this.cloudinaryservice.uploadVideo(videofile);
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
        const videos = await this.videos.findOneAndUpdate(
          { _id: parentId },
          {
            $push: {
              videos: {
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
          childProcess.send(videos.videos);
        });
        let response = await promise;
        return res.status(200).json({
          payload: {
            _id: videos._id,
            details,
            videos: response,
          },
        });
      }
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
    // newevent.eventImageName = result.secure_url;
  }

  async getAllVideoGroups() {
    try {
      const allvideoGroups = await this.videos
        .find()
        .select('_id details createdAt updatedAt');
      return { payload: allvideoGroups };
    } catch (err) {
      throw new InternalServerErrorException({ msg: err?.message });
    }
  }

  async getSingleVideoGroup(videoId: string) {
    try {
      const singleVideoGroup = await this.videos
        .findOne({ _id: videoId })
        .select('_id details videos');
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
        childProcess.send(singleVideoGroup?.videos);
      });
      return {
        payload: {
          _id: singleVideoGroup._id,
          details: singleVideoGroup.details,
          videos: await promise,
        },
      };
    } catch (err) {
      throw new InternalServerErrorException({ msg: err?.message });
    }
  }

  async replaceSingleVideo({
    videofile,
    name,
    parentId,
    oldVideoId,
    res,
  }: {
    videofile: File;
    name: string;
    parentId: string;
    oldVideoId: string;
    res: Response;
  }) {
    try {
      const singleVideoObject = await this.videos.findOne(
        {
          _id: parentId,
          videos: { $elemMatch: { _id: oldVideoId } },
        },
        {
          _id: parentId,
          videos: { $elemMatch: { _id: oldVideoId } },
        },
      );
      if (!singleVideoObject) {
        return res.status(200).json({
          msg: 'Video no longer exists. Check to see if it has not been deleted',
        });
      }
      const publicVideoId = singleVideoObject?.videos[0].public_id;
      await this.cloudinaryservice.destroyVideo(publicVideoId);
      const result = await this.cloudinaryservice.uploadVideo(videofile);
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
      await this.videos.findOneAndUpdate(
        { _id: parentId },
        {
          $push: {
            videos: {
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
      const videos = await this.videos.findOneAndUpdate(
        { _id: parentId },
        {
          $pull: {
            videos: { _id: oldVideoId },
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
        childProcess.send(videos.videos);
      });
      let response = await promise;
      return res.status(200).json({
        payload: {
          _id: videos?._id,
          details: videos?.details,
          videos: response,
        },
      });
    } catch (err) {
      return res.status(500).json(err.message);
    }
  }
  async editVideoDetails({
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
      const videos = await this.videos.findOneAndUpdate(
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
        childProcess.send(videos?.videos);
      });
      let response = await promise;
      return res.status(200).json({
        payload: {
          _id: videos?._id,
          details: videos?.details,
          videos: response,
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }
  async editSingleVideoName({
    name,
    parentId,
    singleVideoId,
    res,
  }: {
    name: string;
    parentId: string;
    singleVideoId: string;
    res: Response;
  }) {
    try {
      const videos = await this.videos.findOneAndUpdate(
        { _id: parentId, 'videos._id': singleVideoId },
        { $set: { 'videos.$.name': name } },
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
        childProcess.send(videos.videos);
      });
      let response = await promise;
      return res.status(200).json({
        payload: {
          _id: videos?._id,
          details: videos?.details,
          videos: response,
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err?.message });
    }
  }

  async deleteSingleVideo({
    parentId,
    videoId,
    res,
  }: {
    parentId: string;
    videoId: string;
    res: Response;
  }) {
    try {
      const singleVideoObject = await this.videos.findOne(
        {
          _id: parentId,
          videos: { $elemMatch: { _id: videoId } },
        },
        {
          _id: parentId,
          videos: { $elemMatch: { _id: videoId } },
        },
      );
      if (!singleVideoObject) {
        return res.status(200).json({
          msg: 'Video no longer exists. Check to see if it has not been deleted',
        });
      }
      const publicVideoId = singleVideoObject?.videos[0].public_id;

      await this.cloudinaryservice.destroyVideo(publicVideoId);
      const videos = await this.videos.findOneAndUpdate(
        { _id: parentId },
        {
          $pull: {
            videos: { _id: videoId },
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
        childProcess.send(videos.videos);
      });
      let response = await promise;
      return res.status(200).json({
        payload: {
          _id: videos?._id,
          details: videos?.details,
          videos: response,
        },
      });
    } catch (err) {
      res.status(500).json({ msg: err?.message });
    }
  }

  async deleteEntireVideoGroup({
    parentVideoId,
    res,
  }: {
    parentVideoId: string;
    res: Response;
  }) {
    try {
      const videoGroup = await this.videos.findOne({ _id: parentVideoId });
      const videoPublicIds: string[] = videoGroup.videos.map(
        (eachVideo: any) => {
          return eachVideo?.public_id;
        },
      );

      await this.cloudinaryservice.destroyMultipleVideos(videoPublicIds);

      await this.videos.findOneAndDelete({ _id: parentVideoId }, { new: true });
      const allvideoGroups = await this.videos
        .find()
        .select('_id details createdAt updatedAt');
      return res.status(200).json({ payload: allvideoGroups });
    } catch (err) {
      return res.status(500).json(err?.message);
    }
  }
}
