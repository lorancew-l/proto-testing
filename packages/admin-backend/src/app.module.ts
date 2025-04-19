import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { ResearchStatisticsModule } from './research-statistics/research-statistics.modulle.';
import { ResearchModule } from './research/research.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, FileUploadModule, ResearchModule, ResearchStatisticsModule],
})
export class AppModule {}
