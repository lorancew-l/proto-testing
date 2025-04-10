import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/database/database.module';

import { PublicationController } from './publication.controller';
import { PublicationService } from './publication.service';

@Module({
  imports: [DatabaseModule],
  providers: [PublicationService],
  controllers: [PublicationController],
})
export class PublicationModule {}
