import { Injectable } from '@nestjs/common';

import { DatabaseService } from 'src/database/database.service';

import { ResearchEvent } from './schema';

@Injectable()
export class EventService {
  constructor(private readonly databaseService: DatabaseService) {}

  public processEvent(
    event: ResearchEvent,
    device: {
      os: string;
      browser: string;
      deviceType: string;
    },
  ) {
    return this.databaseService.insert({
      table: 'research_events',
      values: [
        {
          referer: event.referer,
          research_id: event.researchId,
          session_id: event.sessionId,
          ts: new Date(),
          type: event.type,
          question_id: event.questionId ?? '',
          question_type: event.questionType ?? '',
          answers: event.answers ?? '',
          revision: event.revision,
          device: device.deviceType,
          os: device.os,
          browser: device.browser,
        },
      ],
      clickhouse_settings: {
        date_time_input_format: 'best_effort',
      },
      format: 'JSONEachRow',
    });
  }
}
