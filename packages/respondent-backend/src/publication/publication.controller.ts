import { Body, Controller, Param, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Request } from 'express';

import { PublishResearchDTO } from './publication.dto';
import { PublicationService } from './publication.service';

@ApiTags('publication')
@Controller('/api/publication')
export class PublicationController {
  constructor(private readonly publicationService: PublicationService) {}

  @Post('/:id')
  async publishResearch(@Param('id') id: string, @Body() research: PublishResearchDTO, @Req() req: Request) {
    await this.publicationService.publishResearch({ ...research, id });
    return { url: `${req.protocol}://${req.get('Host')}/research/${id}` };
  }
}
