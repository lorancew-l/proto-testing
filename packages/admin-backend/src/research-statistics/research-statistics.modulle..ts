import { Module } from '@nestjs/common';

import { ResearchStatisticsController } from './research-statistics.controller';
import { ResearchStatisticsService } from './research-statistics.service';
import { StatisticsProviderService } from './statistics-provider.service';

@Module({
  providers: [ResearchStatisticsService, StatisticsProviderService],
  exports: [ResearchStatisticsService],
  controllers: [ResearchStatisticsController],
})
export class ResearchStatisticsModule {}
