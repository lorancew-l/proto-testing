import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '.prisma/client';
import { generateResearch } from 'shared';
import { ResearchStatisticsService } from 'src/research-statistics/research-statistics.service';

import { DatabaseService } from '../database/database.service';

import { PublicationService } from './publication.service';
import { UpdateResearchDTO } from './research.dto';

@Injectable()
export class ResearchService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly publicationService: PublicationService,
    private readonly researchStatisticsService: ResearchStatisticsService,
  ) {}

  async createResearch(userId: string) {
    const research = await this.databaseService.research.create({
      data: {
        name: '',
        ownedBy: userId,
        data: generateResearch() as unknown as Prisma.JsonObject,
        publishedData: Prisma.JsonNull,
      },
    });

    return research;
  }

  async getResearch(id: string) {
    const research = await this.databaseService.research.findUnique({
      where: { id },
    });

    if (!research) {
      throw new NotFoundException(`Research with id ${id} not found`);
    }

    return research;
  }

  async getResearchList(userId: string) {
    const researchList = await this.databaseService.research.findMany({
      select: { id: true, name: true, createdAt: true, updatedAt: true, publishedAt: true },
      orderBy: [{ updatedAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
      where: { ownedBy: userId },
    });

    return Promise.all(
      researchList.map(async (research) => {
        const load = await this.researchStatisticsService.getResearchLoadCount(research.id);

        return {
          ...research,
          load,
        };
      }),
    );
  }

  async updateResearch(id: string, updateResearchDTO: UpdateResearchDTO) {
    try {
      const updatedResearch = await this.databaseService.research.update({
        where: { id },
        data: { data: updateResearchDTO.data as unknown as Prisma.JsonObject, updatedAt: new Date() },
      });
      return updatedResearch;
    } catch {
      throw new NotFoundException(`Research with id ${id} not found`);
    }
  }

  async publishResearch(id: string) {
    const research = await this.databaseService.research.findUnique({
      where: { id },
      select: { data: true },
    });

    const data = research?.data;

    if (!data) {
      throw new BadRequestException(`Research with id ${id} does not exists`);
    }

    return this.publicationService.publishResearch(id, data);
  }
}
