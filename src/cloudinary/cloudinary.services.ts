import { Injectable, NotFoundException } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  async uploadVideo(
    file: any,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    const maxFileSize = 1024 * 1024 * 50;
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        { resource_type: 'video', max_bytes: maxFileSize },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      toStream(file.buffer).pipe(upload);
    });
  }
  async url(videoPublicId: string, options: any) {
    return v2.url(videoPublicId, options);
  }
  async destroyVideo(videoPublicId: string) {
    const result = await v2.uploader.destroy(
      videoPublicId,
      { resource_type: 'video' },
      (err, result) => {
        if (err) throw new NotFoundException(err);
        return result;
      },
    );
    return result;
  }
}
