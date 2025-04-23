import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/database/database.module';

import { ResearchStatisticsController } from './research-statistics.controller';
import { ResearchStatisticsService } from './research-statistics.service';
import { StatisticsProviderService } from './statistics-provider.service';

@Module({
  imports: [DatabaseModule],
  providers: [ResearchStatisticsService, StatisticsProviderService],
  exports: [ResearchStatisticsService],
  controllers: [ResearchStatisticsController],
})
export class ResearchStatisticsModule {}
