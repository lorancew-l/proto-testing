import { createContext, useContext, useMemo } from 'react';

import { useMachine, useSelector } from '@xstate/react';
import type { Research } from 'shared';
import { StateValueFrom, assertEvent, assign, fromCallback, sendTo, setup } from 'xstate';

import { EventSender, IEventSender } from './event-sender';
import type {
  AnswerStackRecord,
  PendingEvent,
  PendingEventStatusUpdate,
  ResearchMachineContext,
  ResearchMachineEvents,
} from './types';
import {
  assertAnswerStackRecordType,
  calculateNextScreen,
  createInitialContext,
  generatePrototypeScreenState,
  getAnswerStackLastRecord,
  getAnswerStackRecord,
  getPrototypeLastScreenState,
  getQuestion,
  pushPendingEvent,
  updateAnswerStackRecord,
  updatePrototypeLastScreenState,
} from './utils';

const createResearchMachine = ({ context, eventSender }: { context: ResearchMachineContext; eventSender: IEventSender }) =>
  setup({
    actors: {
      eventSender: fromCallback<{ type: 'send-event'; event: PendingEvent | PendingEvent[] }>(({ receive, sendBack }) => {
        receive(async (event) => {
          assertEvent(event, 'send-event');
          const pendingEvents = Array.isArray(event.event) ? event.event : [event.event];

          const sendEvent = async (pendingEvent: PendingEvent) => {
            try {
              await eventSender.sendEvent(pendingEvent.payload);
              sendBack({
                type: 'pendingEventStatusUpdate',
                event: { ...pendingEvent, status: 'fulfilled' },
              } satisfies PendingEventStatusUpdate);
            } catch (error) {
              await new Promise((resolve) => setTimeout(resolve, 500));
              sendBack({
                type: 'pendingEventStatusUpdate',
                event: { ...pendingEvent, status: 'rejected' },
              } satisfies PendingEventStatusUpdate);
            }
          };

          pendingEvents.map((pendingEvent) => {
            sendEvent(pendingEvent);
          });
        });
      }),
    },
    types: {} as {
      context: ResearchMachineContext;
      events: ResearchMachineEvents;
    },
    actions: {
      initResearch: assign(({ context }) => {
        return {
          state: calculateNextScreen(context),
        };
      }),
      skipQuestion: assign(({ context }) => {
        if (!context.state.questionId) return {};
        const record = getAnswerStackRecord(context.state.answerStack, context.state.questionId);

        let nextRecord = record;

        if (nextRecord.type === 'prototype') {
          nextRecord = {
            ...nextRecord,
            givenUp: true,
            endTs: Date.now(),
            answers: updatePrototypeLastScreenState(nextRecord.answers, (answer) => ({
              ...answer,
              endTs: Date.now(),
            })),
          };
        } else {
          nextRecord = 'answers' in nextRecord ? { ...nextRecord, answers: [] } : { ...nextRecord, text: '' };
        }

        return {
          state: {
            ...context.state,
            answerStack: updateAnswerStackRecord(context.state.answerStack, nextRecord),
          },
        };
      }),
      selectAnswer: assign(({ context, event }) => {
        assertEvent(event, 'selectAnswer');
        const { state, research } = context;
        const questionId = state.questionId;
        if (!questionId) return context;
        const question = getQuestion(research, questionId);
        if (!question) return context;

        const { answer } = event;
        const answerStackRecord = getAnswerStackRecord(state.answerStack, questionId);

        const nextAnswerStackRecord: AnswerStackRecord = (() => {
          switch (answer.type) {
            case 'single': {
              assertAnswerStackRecordType(answerStackRecord, 'single');
              return {
                ...answerStackRecord,
                answers: [answer.answerId],
              };
            }
            case 'multiple': {
              assertAnswerStackRecordType(answerStackRecord, 'multiple');
              const hasAnswer = answerStackRecord.answers.some((a) => a === answer.answerId);

              return {
                ...answerStackRecord,
                answers: hasAnswer
                  ? answerStackRecord.answers.filter((a) => a !== answer.answerId)
                  : [...answerStackRecord.answers, answer.answerId],
              };
            }
            case 'rating': {
              assertAnswerStackRecordType(answerStackRecord, 'rating');
              return {
                ...answerStackRecord,
                answers: [answer.answerId],
              };
            }
            case 'free-text': {
              assertAnswerStackRecordType(answerStackRecord, 'free-text');
              return {
                ...answerStackRecord,
                text: answer.text,
              };
            }
            case 'prototype':
              assertAnswerStackRecordType(answerStackRecord, 'prototype');

              const { click } = answer;
              const { area } = click;

              const lastScreenState = getPrototypeLastScreenState(answerStackRecord.answers);
              if (!lastScreenState) return answerStackRecord;

              const nextScreen =
                area && question.type === 'prototype' ? question.screens.find((screen) => screen.id === area.goToScreenId) : null;

              const completed = !!nextScreen?.data.targetScreen;

              return {
                ...answerStackRecord,
                completed,
                givenUp: false,
                endTs: Date.now(),
                answers: [
                  ...updatePrototypeLastScreenState(answerStackRecord.answers, (answer) => ({
                    ...answer,
                    endTs: Date.now(),
                    clicks: [...answer.clicks, { x: click.x, y: click.y, areaId: area?.id ?? null, ts: Date.now() }],
                  })),
                  ...(nextScreen ? [generatePrototypeScreenState(nextScreen.id)] : []),
                ],
              };
            default:
              const unknownAnswer: never = answer;
              throw new Error(
                `Unknown answer type ${typeof answer === 'object' ? JSON.stringify(unknownAnswer) : typeof answer}`,
              );
          }
        })();

        return {
          state: {
            ...context.state,
            started: true,
            answerStack: updateAnswerStackRecord(state.answerStack, nextAnswerStackRecord),
          },
        };
      }),
      scheduleLoadEvent: assign(({ context }) => {
        return {
          state: pushPendingEvent(context.state, { type: 'research-load' }),
        };
      }),
      scheduleStartEvent: assign(({ context }) => {
        if (context.state.started) return {};
        return {
          state: { ...pushPendingEvent(context.state, { type: 'research-start' }), started: true },
        };
      }),
      scheduleFinishEvent: assign(({ context }) => {
        return {
          state: pushPendingEvent(context.state, { type: 'research-finish' }),
        };
      }),
      scheduleAnswerEvent: assign(({ context }) => {
        const lastRecord = getAnswerStackLastRecord(context.state);

        return {
          state: lastRecord
            ? pushPendingEvent(context.state, { type: 'research-answer', questionId: lastRecord.questionId, answer: lastRecord })
            : context.state,
        };
      }),
      retryEventSending: sendTo('eventSender', ({ context }) => {
        const failedEvents = context.state.pendingEvents.filter((event) => event.status === 'rejected');
        return {
          type: 'send-event',
          event: failedEvents,
        };
      }),
      setValidationError: assign(() => ({
        validationError: 'Обязательный вопрос',
      })),
      clearValidationError: assign(() => ({
        validationError: undefined,
      })),
      setEventSenderError: assign(() => ({
        eventSenderError: true,
      })),
      clearEventSenderError: assign(() => ({
        eventSenderError: false,
      })),
      calculateNextScreen: assign(({ context }) => {
        return {
          state: calculateNextScreen(context),
        };
      }),
      updatePendingEventStatus: assign(({ context, event }) => {
        assertEvent(event, 'pendingEventStatusUpdate');

        let nextPendingEvents = [...context.state.pendingEvents];

        const eventIndex = nextPendingEvents.findIndex((pendingEvent) => pendingEvent.id === event.event.id);

        if (eventIndex !== -1) {
          nextPendingEvents[eventIndex] = event.event;
        } else {
          nextPendingEvents.push(event.event);
        }

        nextPendingEvents = nextPendingEvents.filter((event) => event.status !== 'fulfilled');

        return {
          state: {
            ...context.state,
            pendingEvents: nextPendingEvents,
          },
        };
      }),
      sendScheduledEvents: sendTo('eventSender', ({ context }) => {
        const scheduledEvents = context.state.pendingEvents.filter((event) => event.status === 'scheduled');

        return {
          type: 'send-event',
          event: scheduledEvents,
        };
      }),
      markEventsSended: assign(({ context }) => {
        const pendingEvents = context.state.pendingEvents.map((event) =>
          event.status === 'scheduled' ? { ...event, status: 'pending' as const } : event,
        );

        return {
          state: {
            ...context.state,
            pendingEvents,
          },
        };
      }),
    },
    guards: {
      isAllEventsSend: ({ context }) => !context.state.pendingEvents.length,
      hasScheduledEvents: ({ context }) => context.state.pendingEvents.some((event) => event.status === 'scheduled'),
      isShouldSetErrorSendingEvents: ({ context }) => {
        return (
          !context.state.pendingEvents.some((event) => event.status === 'pending' || event.status === 'scheduled') &&
          context.state.pendingEvents.some((event) => event.status === 'rejected')
        );
      },
      hasPendingEvents: ({ context }) => context.state.pendingEvents.some((event) => event.status === 'pending'),
      isValidAnswer: ({ context }) => {
        if (!context.state.questionId) return false;
        const record = getAnswerStackRecord(context.state.answerStack, context.state.questionId);
        const question = context.research.questions.find((q) => q.id === record.questionId);
        return !question?.requiresAnswer || ('answers' in record ? !!record.answers.length : !!record.text);
      },
      isSkippable: ({ context }) => {
        if (!context.state.questionId) return false;
        const record = getAnswerStackRecord(context.state.answerStack, context.state.questionId);
        const question = context.research.questions.find((q) => q.id === record.questionId);
        return !question?.requiresAnswer;
      },
      isResearchFinished: ({ context }) => context.state.finished,
    },
  }).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QCc5gIbIMYAsDEADmAHYQCWxUAogG4kAuAyvevQK6wCqBErYA2gAYAuolAEA9rDL0yE4mJAAPRAHYAnKoB0ADgBsAVgBMB9QdWmAjHqMAaEAE9EAWgP6tgy5YDMgvV+MdAwAWAF9Q+1RYDGx8IVEkEElpWXlFFQQQ9S1VIz1vLMELdR1veycEV1Kc-29rQRLg4O8dcMi0TFwtWBZkejx4xWSZOQVEjOcAvS06o29fHUEDQSN1O0cXI2DpvW3LVV3NXxKDNpAomK6ARzY4VOJGLFQSbrYAIwBbGXpIPGiAGzAWHoAEFiLAAO5gZCDRLDe7pFz6SxafLePQYpbqArNcqISyaLRuYIGPR+YKWPyCdFnC6dHBaG53UaPZ7EV6fb6-AFA0HgqEwywJcRSEZpcZIslaHzosnBA6GUx4hA4mYtHQ6VQ6awHMy0jqxRm3Hosp5gF6wd5feg-CB4dD86GwkUpUaIyqrFHBIIGbzyyzbbzqZVGSm6Hy5dTqCPy1oRc4G67G+6s83sy2cm2-B2Qp1CoaihESj1BXSqBrlgpGPwmZWq+YazXavS607xumGpkm+Spi1W74UKBaAjICRYODSSgDEQF13i0AZAkowwUilLJbl4MbBCqbxaba+taa9R6bHzfXRelG5k9s19zOySjD0fj2CTqADfNwwtu4u+5clN4qzNLseSWMq7iniSyzel4JR5BelwMl2KZ3um-Y2oOWhgHQxBMCQEDQlQyCjsgeCoPQyAOLQDCMARg7OkkP7zsoiDBOoghaCe1bRv4RilCSdZaqi6jBCsBIGG4+iaIhV4oaabIctaj5DjhtEEURJESGRjHwr+C6IEGRhEm4GgEvo8zBOsFRzJxoZ6NqJQaEBJRxu0l6dsmClpt0YCAsCAByYBKEwaHTsKTFzmMBkIJYOjGZqBj7A5R5iWYyrOKGBj7vkQS5UemphO2ibIV5t6KTygXBaFbKfhFeksRMSXZPsfghCYdQaMEGWhpxlJNLu-FeC0bjhPGxASIR8CJB2uCzmK0WsZUEZ7vM1Ikqo1j8YYGXNCi-XbPkWq7r6qiyYaPSYPQ81FjFkxAdla1+uYW36AYPWWMZOKHhYzXbG5CYeUmN4PGhN36UtzgcdkaIYmSpg4mU26ZYSRibXBGqmII7HncD3agxVGG2uDjUuOxOj7pScwYt6-jyiG8wzAcoYEksBRxbjpUg726EPoOJOLYuu4zOxAS5A0JTgcjnHyjxfEFA5lKqEV7lIde+M80pA5PiOY4Tvz35Re6RihiL0aWOYPGSyGJsmS2OgUvZxg+Jz6uoYTfNPmpeF0aQmmkQL7qmBTJI4rTWryu924m8ZkktsHVkcf4eiu-J5U+ZV9BBSFPOB8W1bGdivoO80A1WXoGUlES2PWDojTegUAOzQyABmFBkLAOCQHnMWUisWgm008w+GsWoZRJ0pJY3gjkjKY2hEAA */
    id: 'research',
    initial: 'start',
    context,
    invoke: { id: 'eventSender', src: 'eventSender' },
    always: {
      guard: 'hasScheduledEvents',
      actions: ['sendScheduledEvents', 'markEventsSended'],
    },
    on: {
      pendingEventStatusUpdate: {
        actions: ['updatePendingEventStatus'],
      },
    },
    states: {
      start: {
        always: {
          target: 'questionScreen',
          actions: ['initResearch', 'scheduleLoadEvent'],
        },
      },
      questionScreen: {
        initial: 'submitted',

        states: {
          submitted: {
            on: {
              selectAnswer: {
                target: 'submitted',
                actions: ['scheduleStartEvent', 'selectAnswer', 'clearValidationError'],
              },
              answer: [
                {
                  guard: 'isValidAnswer',
                  target: 'submitting',
                  actions: ['scheduleStartEvent', 'scheduleAnswerEvent', 'clearValidationError'],
                },
                {
                  target: 'submitted',
                  actions: ['scheduleStartEvent', 'setValidationError'],
                },
              ],
              skip: [
                {
                  guard: 'isSkippable',
                  target: 'skipping',
                  actions: ['scheduleStartEvent', 'skipQuestion', 'clearValidationError'],
                },
              ],
            },
          },
          skipping: {
            always: {
              target: 'submitting',
              actions: 'scheduleAnswerEvent',
            },
          },
          submitting: {
            initial: 'processing',
            states: {
              processing: {
                always: [
                  {
                    target: '#research.questionScreen.selectNextScreen',
                    guard: 'isAllEventsSend',
                    actions: ['clearEventSenderError', 'calculateNextScreen'],
                  },
                  {
                    target: 'eventSenderError',
                    guard: 'isShouldSetErrorSendingEvents',
                    actions: 'setEventSenderError',
                  },
                ],
              },
              eventSenderError: {
                always: [{ guard: 'hasPendingEvents', target: 'processing' }],
                on: {
                  retryEventSending: {
                    target: 'processing',
                    actions: 'retryEventSending',
                  },
                },
              },
            },
          },
          selectNextScreen: {
            always: [
              { guard: 'isResearchFinished', target: '#research.finished', actions: 'scheduleFinishEvent' },
              { target: 'submitted' },
            ],
          },
        },
      },
      finished: {},
    },
  });

const useResearchMachine = (research: Research & { id: string; revision: number }) => {
  const machine = useMemo(() => {
    const context = createInitialContext(research);
    const eventSender = new EventSender({
      sessionId: context.state.sessionId,
      researchId: research.id,
      appName: import.meta.env.DEV || window.DEV_MODE ? 'test' : 'respondent-frontend',
      revision: research.revision,
    });
    return createResearchMachine({
      context: createInitialContext(research),
      eventSender,
    });
  }, [research]);
  const [state, send, actor] = useMachine(machine);
  return { state, send, actor };
};

const ResearchMachineContext = createContext<ReturnType<typeof useResearchMachine> | null>(null);

export const useResearchMachineContext = () => {
  const value = useContext(ResearchMachineContext);
  if (!value) throw new Error('ResearchMachineContext is required!');
  return value;
};

export const ResearchMachineContextProvider = ({
  research,
  children,
}: {
  research: Research & { id: string; revision: number };
  children: React.ReactNode;
}) => {
  const value = useResearchMachine(research);
  return <ResearchMachineContext.Provider value={value}>{children}</ResearchMachineContext.Provider>;
};

export const useResearchSelector = <T,>(selector: (context: ResearchMachineContext) => T) => {
  const { actor } = useResearchMachineContext();
  return useSelector(actor, (state) => selector(state.context));
};

export const useResearchStatePredicate = (expectedState: StateValueFrom<ReturnType<typeof createResearchMachine>>): boolean => {
  const { actor } = useResearchMachineContext();
  return useSelector(actor, (state) => state.matches(expectedState));
};

export const useIsSubmittingAnswer = () => {
  return useResearchStatePredicate({ questionScreen: { submitting: 'processing' } });
};
