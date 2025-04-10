import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/database/database.module';

import { ResearchController } from './research.controller';
import { ResearchService } from './research.service';

@Module({
  imports: [DatabaseModule],
  providers: [ResearchService],
  controllers: [ResearchController],
})
export class ResearchModule {}
