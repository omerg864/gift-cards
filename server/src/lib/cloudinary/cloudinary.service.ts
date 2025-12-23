import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
// Wait, I should check if extractPublicId exists in shared/utils/functions or if I need to copy it.
// The old server had it in utils/functions.
// Let's create the service first, and I'll check for the util function.

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  uploadImage(
    buffer: Buffer,
    folder: string,
    publicId: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: publicId,
        },
        (error, result) => {
          if (error) {
            return reject(error as Error);
          }
          if (!result) {
            return reject(new Error('No result from Cloudinary'));
          }
          resolve(result.public_id);
        },
      );
      streamifier.createReadStream(buffer).pipe(stream);
    });
  }

  async deleteImage(
    publicId: string,
  ): ReturnType<typeof cloudinary.uploader.destroy> {
    if (!publicId) return null;
    return cloudinary.uploader.destroy(publicId);
  }
}
