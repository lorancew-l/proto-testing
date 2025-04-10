import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

@Injectable()
export class ResearchService {
  constructor(private databaseService: DatabaseService) {}

  async getResearch(id: string) {
    return this.databaseService.publishedResearch.findUnique({ where: { id } });
  }
}
