import { createContext, useContext, useMemo } from 'react';

import { useMachine, useSelector } from '@xstate/react';
import type { Research } from 'shared';
import { assertEvent, assign, fromPromise, setup } from 'xstate';

import type { AnswerStackRecord, ResearchMachineContext, ResearchMachineEvents } from './types';
import { calculateNextScreen, getAnswerStackRecord, getQuestion, updateAnswerStackRecord } from './utils';

const createResearchMachine = ({ context }: { context: ResearchMachineContext }) =>
  setup({
    actors: {
      eventSender: fromPromise(async () => {}),
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

        // @ts-ignore
        const nextAnswerStackRecord: AnswerStackRecord = (() => {
          switch (answer.type) {
            case 'single':
              return {
                ...answerStackRecord,
                type: answer.type,
                answers: [answer.answerId],
              };
            case 'prototype':
              const { click } = answer;
              const { area } = click;
              const nextScreen =
                area && question.type === 'prototype' ? question.screens.find((screen) => screen.id === area.goToScreenId) : null;

              return {
                ...answerStackRecord,
                type: answer.type,
                ...(nextScreen && { screenId: nextScreen.id }),
                answers: [
                  ...answerStackRecord.answers,
                  { x: click.x, y: click.y, areaId: area?.id ?? null },
                ] as AnswerStackRecord['answers'],
              };
            default:
              // @ts-ignore
              const unknownType: never = answer.type;
              throw new Error(`Uknknown answer type ${unknownType}`);
          }
        })();

        return {
          state: { ...context.state, answerStack: updateAnswerStackRecord(state.answerStack, nextAnswerStackRecord) },
        };
      }),
      logLoadEvent: () => {},
      logStartEvent: assign(({ context }) => {
        return {
          state: { ...context.state, startedAt: Date.now() },
        };
      }),
      logFinishEvent: () => {},
      answerQuestion: () => {},
      setValidationError: () => {},
      setEventSenderError: () => {},
      clearEventSenderError: () => {},
      calculateNextScreen: assign(({ context }) => {
        return {
          state: calculateNextScreen(context),
        };
      }),
    },
    guards: {
      isNotStarted: ({ context }) => context.state.startedAt === undefined,
      isValidAnswer: () => true,
      isResearchFinished: ({ context }) => context.state.finishedAt !== undefined,
    },
  }).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QCc5gIbIMYAsB0sALpoQMQDaADALqKgAOA9rAJaEuMB2dIAHogFoAjJQBMATjwBmGaIBsADgCsEoVNFKANCACegqQoAsecVKVz5hoUsOGlSgL4PtqWBmz4AjgFc47LgDKWKhgnATeAEYAtmyEkKRuADZgWIQAgpywAO5gyFS0SCBMrP7chfwIAgDsSpKU4pSKNUrNUnLaepVCVtIKQlVS4qaGckLWVU4uaJi4eD5+HJxBIWGwkTGEcRAJYMmpGdm55EIFDMxsizwV1QqS6qKGCgpylCJSQuIdiMrS9qKiVSGVTkSkowMmIFc7lm8yIi2WYFC4WisXi6EyOTyNB4xQuXCuggBlDwlBaRlBMiqCkaVS+lQUeD6I2UgKMlFsMghUJmXl8cMCwURq3WqO26MOeROOPOpQJlVEUmJomp4lqIgU-1ElAUdJEckZ1KpbRGY2VXOmHjmfNKCKRaxRmxYnCgpAgXDAeCdADdGABrD1gL2hQgBUIQI7Ywq42XlRD9BkKhRVD5VOxGB5aXSEsQmdlmWo1WzKhTmtw8q0LAUrZEbdjO0i5ZCMZB4eiJdCEABmzaieEDwdDnHDWNORRll1jCGVUjwYzktgUBiEWsoUjpojGJPnHKEyg3q4mzkhFph1vhgqR-c4IbDuQAosgm8hSKhCMgdHeg9fBxAnVB8tKJQTqAFRyHU9jvKm6hJkYhi6sqs71KqypVKuy5VKIpbQrylZLBeqy7CkhAAHJgLwIb4RQkZnEB+KTh8xhtFIGFgv8FgKu0WaVAY+pahqwLiIujQWFh5awja+EEIRqSkeRtqcBQUpRuOdEgYIhgbiYCriBh9jiCCGiZp0Ag8XgfEAmBQlyKMThHpwjDhvAhTch4gF4mUaldO8xhqFqRbjCMnHGeYxI2EIciKqhVRUuFomWkQJBuTGnnCPI+q+eyGkBdZdImaCeDzoM5iDEC1KGHFp64fJSXAXwgiLlU0j-I8zyvGhnxcQIhgDNIqb6auOmUNqjhHi5lX8nh1b2rWkA1apdWVN1M4ahuu46VS+m0p1Iizo8ryAoY9SDPI4gVThE3yTWsR-nNHkLWoxIDEm4XPMojTLrlMh4I8ahKBqSYYd1qZnRWF2SVeN5Dvej7NrdcqpngAzAmCRiLtSDzruos4nYaG52IoI1TGWlrieeU3SSRZEUSscP0bceBKB8g0aeIWo6UF+irrt5gam0SOruVo0nvgnZOiwsA4LNym0XdoFtGZLQ2LcQ0WMCn306h-HJqq2oHrZDhAA */
    id: 'research',
    initial: 'start',
    context,
    states: {
      start: {
        always: {
          target: 'questionScreen',
          actions: ['initResearch', 'logLoadEvent'],
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
                  actions: ['logStartEvent', 'selectAnswer'],
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
                  actions: 'answerQuestion',
                },
                {
                  target: 'submitted',
                  actions: 'setValidationError',
                },
              ],
            },
          },
          submitting: {
            invoke: {
              src: 'eventSender',
              onDone: {
                actions: ['clearEventSenderError', 'calculateNextScreen'],
                target: 'selectNextScreen',
              },
              onError: {
                actions: 'setEventSenderError',
                target: 'eventSenderError',
              },
            },
          },
          eventSenderError: {
            on: {
              retryEventSending: {
                target: 'submitting',
              },
            },
          },
          selectNextScreen: {
            always: [
              { guard: 'isResearchFinished', target: '#research.finished', actions: 'logFinishEvent' },
              { target: 'submitted' },
            ],
          },
        },
      },
      finished: {
        type: 'final',
      },
    },
  });

const createIntitalContext = (research: Research & { id: string }): ResearchMachineContext => {
  return {
    research,
    state: {
      answerStack: [],
      pendingEvents: [],
    },
  };
};

const useResearchMachine = (research: Research & { id: string }) => {
  const machine = useMemo(() => createResearchMachine({ context: createIntitalContext(research) }), [research]);
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
  research: Research & { id: string };
  children: React.ReactNode;
}) => {
  const value = useResearchMachine(research);
  return <ResearchMachineContext.Provider value={value}>{children}</ResearchMachineContext.Provider>;
};

export const useResearchSelector = <T,>(selector: (context: ResearchMachineContext) => T) => {
  const { actor } = useResearchMachineContext();
  return useSelector(actor, (state) => selector(state.context));
};
