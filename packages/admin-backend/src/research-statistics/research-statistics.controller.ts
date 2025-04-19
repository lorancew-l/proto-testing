import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AccessGuard } from '../auth/guards';

import { ResearchStatisticsService } from './research-statistics.service';

@ApiTags('statistics')
@Controller('stats')
export class ResearchStatisticsController {
  constructor(private readonly researchStatisticsService: ResearchStatisticsService) {}

  @Get(':id')
  @ApiBearerAuth('Authorization')
  @UseGuards(AccessGuard)
  getResearchStats(@Param('id') researchId: string) {
    return this.researchStatisticsService.getStatistics(researchId);
  }
}
