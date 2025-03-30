import { Injectable } from '@nestjs/common';

import { S3StorageService } from '../s3-storage/s3-storage.service';

@Injectable()
export class FileUploadService {
  private bucket = 'media';

  constructor(private readonly s3StorageService: S3StorageService) {}

  async uploadFile(file: Express.Multer.File) {
    return this.s3StorageService.uploadFile(file, this.bucket);
  }
}
