import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });
  }

  async uploadImage(
    directory_name: string,
    file: Express.Multer.File,
  ): Promise<UploadApiResponse> {
    try {
      const uploadResult = await new Promise<UploadApiResponse>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: directory_name,
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            },
          );
          stream.write(file.buffer);
          stream.end();
        },
      );
      return uploadResult;
    } catch (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }
}
