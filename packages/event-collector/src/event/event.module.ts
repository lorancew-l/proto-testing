import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';

import { EventController } from './event.controller';
import { EventService } from './event.service';

@Module({
  imports: [DatabaseModule],
  providers: [EventService],
  controllers: [EventController],
})
export class EventModule {}
