import { Module } from '@nestjs/common';

import { S3StorageModule } from '../s3-storage/s3-storage.module';

import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';

@Module({
  imports: [S3StorageModule],
  providers: [FileUploadService],
  controllers: [FileUploadController],
})
export class FileUploadModule {}
