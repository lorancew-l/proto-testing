import { Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '.prisma/client';
import { generateResearch } from 'shared';

import { DatabaseService } from '../database/database.service';

import { UpdateResearchDTO } from './research.dto';

@Injectable()
export class ResearchService {
  constructor(private databaseService: DatabaseService) {}

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
    return this.databaseService.research.findMany({
      select: { id: true, name: true, createdAt: true, updatedAt: true, publishedAt: true },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      where: { ownedBy: userId },
    });
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
}
