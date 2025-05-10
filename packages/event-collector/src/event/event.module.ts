import { Module } from '@nestjs/common';

import { EnrichmentModule } from 'src/enrichment/enrichment.module';

import { DatabaseModule } from '../database/database.module';

import { EventController } from './event.controller';
import { EventService } from './event.service';

@Module({
  imports: [DatabaseModule, EnrichmentModule],
  providers: [EventService],
  controllers: [EventController],
})
export class EventModule {}
