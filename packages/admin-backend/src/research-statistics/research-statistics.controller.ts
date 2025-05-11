import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AccessGuard } from '../auth/guards';

import { ResearchStatisticsService, StatFilterParams } from './research-statistics.service';

@ApiTags('statistics')
@Controller('stats')
export class ResearchStatisticsController {
  constructor(private readonly researchStatisticsService: ResearchStatisticsService) {}

  @Post(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('Authorization')
  @UseGuards(AccessGuard)
  getResearchStats(
    @Param('id') research_id: string,
    @Body() params: Omit<StatFilterParams, 'revision'> & { revision: number | undefined },
  ) {
    return this.researchStatisticsService.getStatistics({ ...params, research_id });
  }

  @Get(':id/suggestions/:param')
  @ApiBearerAuth('Authorization')
  @UseGuards(AccessGuard)
  getSuggestions(@Param('id') research_id: string, @Param('param') param: string) {
    switch (param) {
      case 'device':
        return this.researchStatisticsService.getAvailableDevice(research_id);
      case 'os':
        return this.researchStatisticsService.getAvailableOS(research_id);
      case 'browser':
        return this.researchStatisticsService.getAvailableBrowser(research_id);
      case 'referer':
        return this.researchStatisticsService.getRefererParameterKeys(research_id);
      default:
        return [];
    }
  }
}
