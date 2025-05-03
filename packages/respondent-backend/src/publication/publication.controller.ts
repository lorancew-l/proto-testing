import { Body, Controller, Param, Post, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

import { Request } from 'express';

import { PublishResearchDTO } from './publication.dto';
import { PublicationService } from './publication.service';

@ApiTags('publication')
@Controller('/api/publication')
export class PublicationController {
  private readonly origin: string;

  constructor(
    private readonly publicationService: PublicationService,
    configService: ConfigService,
  ) {
    const origin = configService.get<string>('ORIGIN');
    if (!origin) throw new Error('Missing ORIGIN variable');
    this.origin = origin;
  }

  @Post('/:id')
  async publishResearch(@Param('id') id: string, @Body() research: PublishResearchDTO, @Req() req: Request) {
    await this.publicationService.publishResearch({ ...research, id });
    return { url: `${req.protocol}://${this.origin}/research/${id}` };
  }
}
