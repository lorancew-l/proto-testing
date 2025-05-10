import type { Question } from 'shared';

import type { ResearchEvent } from './types';

export interface IEventSender {
  sendEvent(event: ResearchEvent): Promise<unknown>;
}
export interface CommonData {
  sessionId: string;
  researchId: string;
  appName: string;
  revision: number;
}

interface EventSenderEvent extends CommonData {
  referer: string;
  type: ResearchEvent['type'];
  questionId: string | null;
  questionType: Question['type'] | null;
  answers: string | null;
  revision: number;
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

  private buildAnswers(event: Extract<ResearchEvent, { type: 'research-answer' }>) {
    if (event.answer.type === 'prototype') {
      return JSON.stringify({
        answers: event.answer.answers,
        startTs: event.answer.startTs,
        endTs: event.answer.endTs,
        completed: event.answer.completed,
        givenUp: event.answer.givenUp,
      });
    }

    if (event.answer.type === 'free-text') {
      return event.answer.text;
    }

    return JSON.stringify(event.answer.answers);
  }

  public sendEvent(event: ResearchEvent) {
    return this.postEvent({
      referer: window.location.href,
      type: event.type,
      answers: event.type === 'research-answer' ? this.buildAnswers(event) : null,
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
      referer: window.location.href,
      type: event.type,
      answers: 'answer' in event ? ('answers' in event.answer ? JSON.stringify(event.answer.answers) : event.answer.text) : null,
      questionId: 'questionId' in event ? event.questionId : null,
      questionType: 'answer' in event ? event.answer.type : null,
    });
  }
}

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
