import { Injectable } from '@nestjs/common';

import { DatabaseService } from 'src/database/database.service';

import { ResearchEvent } from './schema';

@Injectable()
export class EventService {
  constructor(private readonly databaseService: DatabaseService) {}

  public processEvent(event: ResearchEvent) {
    return this.databaseService.insert({
      table: 'research_events',
      values: [
        {
          research_id: event.researchId,
          session_id: event.sessionId,
          ts: new Date(),
          type: event.type,
          question_id: event.questionId ?? '',
          question_type: event.questionType ?? '',
          answers: event.answers ?? '',
          revision: event.revision,
        },
      ],
      clickhouse_settings: {
        date_time_input_format: 'best_effort',
      },
      format: 'JSONEachRow',
    });
  }
}
