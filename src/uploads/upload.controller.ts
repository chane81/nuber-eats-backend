import {
  Controller,
  Inject,
  Injectable,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';
import { ConfigType } from '@nestjs/config';
import envConfig from '../config/env.config';

@Injectable()
@Controller('uploads')
export class UploadController {
  constructor(
    @Inject(envConfig.KEY)
    private env: ConfigType<typeof envConfig>,
  ) {}

  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    const bucketName = this.env.AWS_S3_BUCKET_NAME;

    AWS.config.update({
      credentials: {
        accessKeyId: this.env.AWS_S3_ACCKEY,
        secretAccessKey: this.env.AWS_S3_SECRET,
      },
    });

    try {
      const objectName = `${Date.now() + file.originalname}`;
      await new AWS.S3()
        .putObject({
          Body: file.buffer,
          Bucket: bucketName,
          Key: objectName,
          ACL: 'public-read',
        })
        .promise();

      const url = `https://${bucketName}.s3.amazonaws.com/${objectName}`;

      return { url };
    } catch (e) {
      return null;
    }
  }
}
