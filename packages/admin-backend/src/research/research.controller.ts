import { Body, Controller, ForbiddenException, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { GetUserId } from 'src/auth/decorators';

import { AccessGuard } from '../auth/guards';

import { UpdateResearchDTO } from './research.dto';
import { ResearchService } from './research.service';

@ApiTags('research')
@Controller('research')
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Post()
  @ApiBearerAuth('Authorization')
  @UseGuards(AccessGuard)
  createResearch(@GetUserId() userId: string) {
    return this.researchService.createResearch(userId);
  }

  @Get()
  @ApiBearerAuth('Authorization')
  @UseGuards(AccessGuard)
  getResearchList(@GetUserId() userId: string) {
    return this.researchService.getResearchList(userId);
  }

  @Get(':id')
  @ApiBearerAuth('Authorization')
  @UseGuards(AccessGuard)
  async getResearch(@Param('id') id: string, @GetUserId() userId: string) {
    const research = await this.researchService.getResearch(id);

    if (research.ownedBy !== userId) {
      throw new ForbiddenException();
    }

    return research;
  }

  @Post(':id')
  @ApiBearerAuth('Authorization')
  @UseGuards(AccessGuard)
  @HttpCode(200)
  async updateResearch(@Param('id') id: string, @GetUserId() userId: string, @Body() updateResearchDTO: UpdateResearchDTO) {
    const research = await this.researchService.getResearch(id);

    if (research.ownedBy !== userId) {
      throw new ForbiddenException();
    }

    return this.researchService.updateResearch(id, updateResearchDTO);
  }
}
