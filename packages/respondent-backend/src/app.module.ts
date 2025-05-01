import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PublicationModule } from './publication/publication.module';
import { ResearchModule } from './research/research.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PublicationModule, ResearchModule],
})
export class AppModule {}
