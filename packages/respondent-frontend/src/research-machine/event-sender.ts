import type { Question } from 'shared';

import type { ResearchEvent } from './types';

export interface IEventSender {
  sendEvent(event: ResearchEvent): Promise<unknown>;
}
export interface CommonData {
  sessionId: string;
  researchId: string;
  appName: string;
}

interface EventSenderEvent extends CommonData {
  type: ResearchEvent['type'];
  questionId: string | null;
  questionType: Question['type'] | null;
  answers: string | null;
}

export class EventSender implements IEventSender {
  private readonly baseUrl = import.meta.env.VITE_STATISTIC_SERVICE_URL;

  constructor(private readonly commonData: CommonData) {}

  private postEvent(eventData: Omit<EventSenderEvent, keyof CommonData>) {
    return fetch(new URL('/event', this.baseUrl), {
      method: 'POST',
      body: JSON.stringify({
        ...eventData,
        ...this.commonData,
      } satisfies EventSenderEvent),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public sendEvent(event: ResearchEvent) {
    return this.postEvent({
      type: event.type,
      answers: 'answer' in event ? JSON.stringify(event.answer.answers) : null,
      questionId: 'questionId' in event ? event.questionId : null,
      questionType: 'answer' in event ? event.answer.type : null,
    });
  }
}

export class EventSenderMock implements IEventSender {
  constructor(private readonly commonData: CommonData) {}

  private postEvent(eventData: Omit<EventSenderEvent, keyof CommonData>) {
    console.log('SEND EVENT', {
      ...eventData,
      ...this.commonData,
    });
    return new Promise<void>((resolve) => {
      setTimeout(() => resolve(), randomInRange(600, 2000));
    });
  }

  public sendEvent(event: ResearchEvent) {
    return this.postEvent({
      type: event.type,
      answers: 'answer' in event ? JSON.stringify(event.answer.answers) : null,
      questionId: 'questionId' in event ? event.questionId : null,
      questionType: 'answer' in event ? event.answer.type : null,
    });
  }
}

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
