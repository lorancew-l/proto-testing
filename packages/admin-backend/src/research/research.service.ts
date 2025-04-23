import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

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

  private async getLatestRevision(researchId: string) {
    const foundResearch = await this.databaseService.publishedResearch.findFirst({
      orderBy: { revision: 'desc' },
      where: { id: researchId },
      select: { revision: true },
    });
    return foundResearch ? foundResearch.revision : null;
  }

  async createResearch(userId: string) {
    const research = await this.databaseService.research.create({
      data: {
        name: '',
        ownedBy: userId,
        data: generateResearch() as unknown as Prisma.JsonObject,
      },
    });

    return research;
  }

  async getResearch(id: string) {
    const research = await this.databaseService.research.findUniqueOrThrow({
      where: { id },
    });

    return research;
  }

  async getPublishedResearch(id: string, revision?: number) {
    const resolvedRevision = revision ?? (await this.getLatestRevision(id));
    if (resolvedRevision === null) throw new ResearchNotPublishedError();

    const research = await this.databaseService.publishedResearch.findUniqueOrThrow({
      include: { research: { select: { ownedBy: true } } },
      where: { publishedId: { id, revision: resolvedRevision } },
    });

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

  async publishResearch(
    id: string,
    { increaseRevision, pauseResearch }: { increaseRevision?: boolean; pauseResearch?: boolean } = {},
  ) {
    const research = await this.databaseService.research.findUnique({
      where: { id },
      select: { data: true, publishedRevision: true },
    });

    const data = research?.data as object | undefined | null;

    if (!data) {
      throw new BadRequestException(`Research with id ${id} does not exists`);
    }

    try {
      const currentRevision = research?.publishedRevision ?? 1;
      const nextRevision = currentRevision + (increaseRevision ? 1 : 0);

      const { url } = await this.publicationService.publishResearch({ id, data, revision: nextRevision, pauseResearch });

      const [updatedResearch] = await this.databaseService.$transaction([
        this.databaseService.research.update({
          where: { id },
          data: { publishedAt: new Date(), publishedRevision: nextRevision, publishedUrl: url },
        }),
        this.databaseService.publishedResearch.upsert({
          update: {
            id,
            data,
            revision: nextRevision,
          },
          create: {
            id,
            data: data,
            revision: nextRevision,
          },
          where: {
            publishedId: {
              id,
              revision: nextRevision,
            },
          },
        }),
      ]);

      return updatedResearch;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}

export class ResearchNotPublishedError extends Error {
  constructor() {
    super('Research not published!');
  }
}
