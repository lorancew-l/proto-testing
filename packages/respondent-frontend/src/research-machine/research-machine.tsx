import { createContext, useContext, useMemo } from 'react';

import { useMachine, useSelector } from '@xstate/react';
import type { Research } from 'shared';
import { StateValueFrom, assertEvent, assign, fromCallback, sendTo, setup } from 'xstate';

import { EventSender, IEventSender } from './event-sender';
import type {
  AnswerStackRecord,
  PendingEvent,
  PendingEventStatusUpdate,
  PrototypeQuestionAnswerState,
  ResearchMachineContext,
  ResearchMachineEvents,
} from './types';
import {
  calculateNextScreen,
  createInitialContext,
  getAnswerStackRecord,
  getQuestion,
  pushPendingEvent,
  updateAnswerStackRecord,
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
              sendBack({
                type: 'pendingEventStatusUpdate',
                event: { ...pendingEvent, status: 'pending' },
              } satisfies PendingEventStatusUpdate);
              await eventSender.sendEvent(pendingEvent.event);
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
            case 'single':
              return {
                ...answerStackRecord,
                type: answer.type,
                answers: [answer.answerId],
              };
            case 'prototype':
              const { click, screenId, ssid, screenTime } = answer;
              const { area } = click;

              const prevRecord = answerStackRecord as Extract<AnswerStackRecord, { type: 'prototype' }>;

              const currentScreenId = prevRecord.screenId;
              const nextScreen =
                area && question.type === 'prototype' ? question.screens.find((screen) => screen.id === area.goToScreenId) : null;

              const completed = !!nextScreen?.data.areas.every((area) => !area.goToScreenId);

              return {
                ...prevRecord,
                type: answer.type,
                completed,
                givenUp: false,
                ...(nextScreen && { screenId: nextScreen.id }),
                ...(completed && { endTs: Date.now() }),
                ...(nextScreen && currentScreenId && { screenTime: { ...prevRecord.screenTime, [currentScreenId]: screenTime } }),
                answers: [
                  ...(answerStackRecord.answers as PrototypeQuestionAnswerState['answers']),
                  { x: click.x, y: click.y, screenId, ssid, areaId: area?.id ?? null, ts: Date.now() },
                ],
              };
            default:
              // @ts-ignore
              const unknownType: never = answer.type;
              throw new Error(`Unknown answer type ${unknownType}`);
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
        return {
          state: pushPendingEvent(context.state, { type: 'research-start' }),
        };
      }),
      scheduleFinishEvent: assign(({ context }) => {
        return {
          state: pushPendingEvent(context.state, { type: 'research-finish' }),
        };
      }),
      scheduleAnswerEvent: assign(({ context }) => {
        const answerStack = context.state.answerStack;
        const lastRecord = answerStack[answerStack.length - 1];

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
      setValidationError: () => {},
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
      isNotStarted: ({ context }) => !context.state.started,
      isValidAnswer: () => true,
      isResearchFinished: ({ context }) => context.state.finished,
    },
  }).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QCc5gIbIMYAsDEADmAHYQCWxUAogG4kAuAyvevQK6wCqBErYA2gAYAuolAEA9rDL0yE4mJAAPRAA4ALOoB0qgOyqAzOsEBGDQYBMBgwBoQAT0QBaPdpPqDATgOqArADZfdRNfCwBfMLtUWAxsfCFRJBBJaVl5RRUEX103XQMTUzzBHxNdO0cEF38DLU9-QWKrL10Q8MiQaNjcLVgWZHo8BMUUmTkFJMynAs9VLQNdC08LYvVfa39y53VPQS1S4uzfHeDiiKi0TG6ARzY4NOJGLFQSHrYAIwBbGXpIPBiAGzAWHoAEFiLAAO5gZBDJIje4ZZyGXRaQSrIKGVSqar+CybSqrWpefz+JaCUIGQQ5M4dC5xLQ3O5jR7PYivT7fX4AoGg8FQmEmRLiKSjdITJEGXxaIK+IIWVTk7y6Tz4kwFHTuQLK3Ro-SrGmdS44Bm3XrMp5gF6wd5feg-CB4dB86Gw4WpMaIyoWEk6Tw5fYeJYFXz4pyWLQtNGeaOWIKWVQGunXU33FmWtnWjl235OyEuwXDEUI8Ve-wmLTy+WhfyqExGVbqVXq2vqLV+3UafyJmJGk1M+Rpq0274UKBaAjICRYODSSiDESF91i0CZCwmfwV9QWCy+PRr+VYjYOZz7VG7wykklHXQ37tdY2Ms0Di1DrOySjjyfT2CzqCDAtwkWHolrKG7yv4miRi0mgmKGIQbqoiz+MqBiBIISyGHevaPqmL4ZsOdqjloYB0MQTAkBA0JUMgk7IHgqD0Mg9i0AwjAUaOrrJEBy7KIgvghNKviCMsGGSqEIbHggdZSuufpBuhRxHFh9I4earLsra75jiRrEUVRNESHRnHwsBK6IMEKKajsdTZOSa5HhUUw1JSOToXUl5qtGynJv2Dx4T0YCAsCAByYBKEweHzkKXFLuMZkIGuNTorWgh+BYxgWGUklOOougbiYngmMsRjZDsCbtIaKkpmp6YBUF9CheFg7EP+0UmTxkzbNou47qhPWtu4oarDUuJ6MURU5IsugRO0xASJR8BJJVuCLqKcW8ZUdbqn6pT1KongeBoEmOch2ijYEa5FIYnjecavSYPQq3FvFUzehYtQtHlqUHT4qxDbKOj6DqghlrWyHTRVSYPtVz6sk9pkbS4fioui6iYtiqF4tlQS7Mqawkohej8TdkM9lVvnNRpnIQPDHVbHkOjbmq+03vtyFwbs7gKqUB3oV43ok+cZM+U+fnqZmmmjrT62ZAVKJKk0XilOuIOhulNTRtUHggxBITCbdfai5TEsjh+E5TjOUuAbFnrpVKCvWErLT1A5zjLLUp2rAsrY+N4vgG6psO1SbhEfjpZFsaQ+m0dLnq4jUaLrriax+IErtersdQ5MDxS-YLtLC9DFP+dyIVhRFcPW2ttuZdKVhCWu5IFduWOOUY73CddWIudnBsAGYUGQsA4JAsclmSewu7KpTBIhsHZV7ezgfUu43q26gzWEQA */
    id: 'research',
    initial: 'start',
    context,
    invoke: { id: 'eventSender', src: 'eventSender' },
    always: {
      guard: 'hasScheduledEvents',
      actions: 'sendScheduledEvents',
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
              selectAnswer: [
                {
                  target: 'submitted',
                  guard: 'isNotStarted',
                  actions: ['scheduleStartEvent', 'selectAnswer'],
                },
                {
                  target: 'submitted',
                  actions: 'selectAnswer',
                },
              ],
              answer: [
                {
                  guard: 'isValidAnswer',
                  target: 'submitting',
                  actions: 'scheduleAnswerEvent',
                },
                {
                  target: 'submitted',
                  actions: 'setValidationError',
                },
              ],
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
