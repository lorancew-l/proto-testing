import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/database/database.module';
import { ResearchStatisticsModule } from 'src/research-statistics/research-statistics.modulle.';

import { PublicationService } from './publication.service';
import { ResearchController } from './research.controller';
import { ResearchService } from './research.service';

@Module({
  imports: [DatabaseModule, ResearchStatisticsModule],
  providers: [ResearchService, PublicationService],
  controllers: [ResearchController],
})
export class ResearchModule {}
