import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { readFileSync } from 'fs';
import * as mustache from 'mustache';
import { join } from 'path';

import { ResearchService } from './research.service';

@ApiTags('Research')
@Controller('research')
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Get('/:id')
  async showResearch(@Param('id') id: string) {
    const research = await this.researchService.getResearch(id);
    if (!research) throw new NotFoundException();

    if (research.paused) {
      const documentPath = join(__dirname, 'paused.html');
      const document = readFileSync(documentPath, 'utf-8');
      return document;
    }

    const templatePath = join(__dirname, 'research.template.mustache');
    const template = readFileSync(templatePath, 'utf-8');

    const document = mustache.render(template, {
      data: JSON.stringify({ ...(research.data as object), id: research.id }),
      cdnUrl: research.cdnUrl,
    });
    return document;
  }
}
