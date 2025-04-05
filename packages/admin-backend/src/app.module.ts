import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { ResearchModule } from './research/research.module';
import { S3StorageModule } from './s3-storage/s3-storage.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, S3StorageModule, FileUploadModule, ResearchModule],
})
export class AppModule {}
