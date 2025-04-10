import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

import { PublishResearchDTO } from './publication.dto';

@Injectable()
export class PublicationService {
  constructor(private databaseService: DatabaseService) {}

  async publishResearch(research: PublishResearchDTO & { id: string }) {
    return this.databaseService.publishedResearch.upsert({
      update: research,
      create: research,
      where: {
        id: research.id,
      },
    });
  }
}
