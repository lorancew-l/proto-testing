import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Client } from 'minio';

@Injectable()
export class S3StorageService {
  private readonly s3Client: Client;
  private readonly endpoint: string;
  private readonly port: string;

  constructor(configService: ConfigService) {
    const endPoint = configService.get<string>('MINIO_ENDPOINT');
    const port = configService.get<string>('MINIO_PORT');
    if (!endPoint) throw new Error('Missing MINIO_ENDPOINT variable');
    if (!port) throw new Error('Missing MINIO_PORT variable');
    this.endpoint = endPoint;
    this.port = port;

    this.s3Client = new Client({
      endPoint,
      port: configService.get('MINIO_PORT'),
      accessKey: configService.get('MINIO_ROOT_USER'),
      secretKey: configService.get('MINIO_ROOT_PASSWORD'),
      useSSL: configService.get('MINIO_USE_SSL') === 'true',
    });
  }

  private async setPublicReadPolicy(bucket: string) {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${bucket}/*`,
        },
      ],
    };
    await this.s3Client.setBucketPolicy(bucket, JSON.stringify(policy));
  }

  private async ensureBucketExists(bucket: string) {
    const exists = await this.s3Client.bucketExists(bucket);
    if (!exists) {
      await this.s3Client.makeBucket(bucket);
      await this.setPublicReadPolicy(bucket);
    }
  }

  async uploadFile(file: Express.Multer.File, bucket: string) {
    await this.ensureBucketExists(bucket);
    const fileName = `${Date.now()}-${file.originalname}`;
    await this.s3Client.putObject(bucket, fileName, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });

    const url = `http://${this.endpoint}:${this.port}/${bucket}/${fileName}`;
    return { url };
  }
}
