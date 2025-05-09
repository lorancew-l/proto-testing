import { BadRequestException, Body, Controller, InternalServerErrorException, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ZodError } from 'zod';

import { EventService } from './event.service';
import { researchEventSchema } from './schema';

@ApiTags('Event')
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async processEvent(@Body() event: unknown) {
    try {
      const validatedEvent = researchEventSchema.parse(event);

      if (validatedEvent.appName !== 'test') {
        await this.eventService.processEvent(validatedEvent);
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
