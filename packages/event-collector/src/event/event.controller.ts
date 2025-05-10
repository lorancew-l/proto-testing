import { BadRequestException, Body, Controller, InternalServerErrorException, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Request } from 'express';
import { EnrichmentService } from 'src/enrichment/enrichment.service';
import { ZodError } from 'zod';

import { EventService } from './event.service';
import { researchEventSchema } from './schema';

@ApiTags('Event')
@Controller('event')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly enrichmentService: EnrichmentService,
  ) {}

  @Post()
  async processEvent(@Body() event: unknown, @Req() request: Request) {
    try {
      const validatedEvent = researchEventSchema.parse(event);

      if (validatedEvent.appName !== 'test') {
        const device = this.enrichmentService.getDeviceDetails(request);
        await this.eventService.processEvent(validatedEvent, device);
      }

      return 'Ok';
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(error.errors);
      }

      throw new InternalServerErrorException(error);
    }
  }
}
