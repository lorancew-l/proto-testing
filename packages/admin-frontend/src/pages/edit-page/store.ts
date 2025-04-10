import { useCallback, useEffect, useRef } from 'react';
import { FieldPathValue, Path } from 'react-hook-form';

import { get as _get, set as _set, isFunction, omit } from 'lodash';

import { move } from '@dnd-kit/helpers';
import { nanoid } from 'nanoid';
import { Question, Research, generateAnswer, generateQuestion } from 'shared';
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type Section = 'research' | 'preview' | 'publish' | 'stats';

interface EditPageStoreState {
  section: Section;
  research: Research & { id: string };
  publishedResearch: (Research & { publishedAt: string; publishedBy: string }) | null;
  form: {
    scheduledFocusPath: string | null;
    registeredFields: Partial<
      Record<Path<Fields>, { focus: VoidFunction; scrollIntoView: VoidFunction; questionId?: string; answerId?: string }>
    >;
  };
}

export type Fields = Pick<EditPageStore, 'research'>;

interface EditPageStoreActions {
  setResearch: (research: Research & { id: string }) => void;
  getResearch: () => Research & { id: string };
  setSection: (section: Section) => void;
  removeQuestion: (id: string) => void;
  duplicateQuestion: (id: string) => void;
  changeQuestionType: (id: string, type: Question['type']) => void;
  appendQuestion: () => void;
  insertQuestion: (index: number) => void;
  appendAnswer: (questionId: string) => void;
  removeAnswer: (questionId: string, answerId: string) => void;
  moveAnswer: (questionId: string, event: Parameters<typeof move>[1]) => void;
  form: {
    getFieldValue: <T extends Path<Fields>>(field: T) => FieldPathValue<Fields, T>;
    setFieldValue: <T extends Path<Fields>>(field: T, value: FieldPathValue<Fields, T>) => void;
    registerField: (
      path: Path<Fields>,
      handle: { focus: VoidFunction; scrollIntoView: VoidFunction },
      questionId?: string,
      answerId?: string,
    ) => void;
    unregisterField: (path: Path<Fields>) => void;
    focus: (path: Path<Fields>) => void;
  };
}

export interface EditPageStore extends EditPageStoreState {
  actions: EditPageStoreActions;
}

const getStoreDefaultValue = (): Omit<EditPageStore, 'actions'> => ({
  research: {
    id: '',
    questions: [],
  },
  publishedResearch: null,
  section: 'research',
  form: {
    registeredFields: {},
    scheduledFocusPath: null,
  },
});

export const useEditPageStore = create<EditPageStore>()(
  devtools(
    immer(
      subscribeWithSelector((set, get) => ({
        ...getStoreDefaultValue(),
        actions: {
          setResearch: (research) => set({ research }),
          getResearch: () => get().research,
          form: {
            setFieldValue: (field, value) =>
              set((state) => {
                _set(state, field, value);
              }),
            getFieldValue: <T extends Path<Fields>>(field: T) => _get(get(), field) as FieldPathValue<Fields, T>,
            registerField: (path, handle, questionId, answerId) =>
              set((state) => {
                let shouldResetScheduledFocusPath = false;

                if (path === state.form.scheduledFocusPath) {
                  handle.focus();
                  handle.scrollIntoView();
                  shouldResetScheduledFocusPath = true;
                }

                return {
                  ...state,
                  form: {
                    ...state.form,
                    registeredFields: { ...state.form.registeredFields, [path]: { ...handle, questionId, answerId } },
                    ...(shouldResetScheduledFocusPath && { scheduledFocusPath: null }),
                  },
                };
              }),
            unregisterField: (path) =>
              set((state) => {
                return {
                  ...state,
                  form: {
                    ...state.form,
                    registeredFields: omit(state.form.registeredFields, path),
                  },
                };
              }),
            focus: (path) =>
              set((state) => {
                const registeredFields = state.form.registeredFields;
                const handle = registeredFields[path];

                const questionIdPath = getQuestionIdPathFromPath(path);
                const answerIdPath = getAnswerIdPathFromPath(path);

                const currentQuestionId = questionIdPath ? _get(state, questionIdPath) : undefined;
                const currentAnswerId = answerIdPath ? _get(state, answerIdPath) : undefined;

                if (
                  handle &&
                  (!handle.questionId || handle.questionId === currentQuestionId) &&
                  (!handle.answerId || handle.answerId === currentAnswerId)
                ) {
                  handle.focus();
                } else {
                  state.form.scheduledFocusPath = path;
                }
              }),
          },
          setSection: (section) => set({ section }),
          removeQuestion: (id) =>
            set((state) => {
              state.research.questions = state.research.questions.filter((q) => q.id !== id);
            }),
          duplicateQuestion: (id) =>
            set((state) => {
              const { questions } = state.research;
              const questionToCopyIndex = questions.findIndex((q) => q.id === id);
              const questionToCopy = questions[questionToCopyIndex];
              if (!questionToCopy) return;

              const nextQuestions = [...questions];
              nextQuestions.splice(questionToCopyIndex, 0, {
                ...questionToCopy,
                id: nanoid(10),
                ...('answers' in questionToCopy && { answers: questionToCopy.answers.map((a) => ({ ...a, id: nanoid(10) })) }),
              });

              state.research.questions = nextQuestions;
            }),
          changeQuestionType: (id, type) =>
            set((state) => {
              const { questions } = state.research;
              const questionIndex = questions.findIndex((q) => q.id === id);
              const question = questions[questionIndex];
              if (!question) return;
              questions[questionIndex] = generateQuestion(type, {
                id: question.id,
                text: question.text,
                ...('answers' in question &&
                  type !== 'rating' &&
                  type !== 'prototype' && {
                    answers: question.answers.map((a) => generateAnswer(type, { id: a.id, text: a.text })),
                  }),
              });
            }),
          insertQuestion: (index) => {
            const state = get();
            const { questions } = state.research;
            const nextQuestions = [...questions];
            nextQuestions.splice(index, 0, generateQuestion('single'));

            set((state) => {
              state.research.questions = nextQuestions;
            });
            state.actions.form.focus(`research.questions.${index}.text`);
          },
          appendQuestion: () => {
            get().actions.insertQuestion(get().research.questions.length);
          },
          appendAnswer: (questionId) => {
            const state = get();

            const { questions } = state.research;
            const questionIndex = questions.findIndex((q) => q.id === questionId);
            const question = questions[questionIndex];

            if (!(question && 'answers' in question)) return;

            const nextQuestion = { ...question, answers: [...question.answers, generateAnswer(question.type)] };

            set((state) => {
              state.research.questions[questionIndex] = nextQuestion;
            });
            state.actions.form.focus(`research.questions.${questionIndex}.answers.${nextQuestion.answers.length - 1}.text`);
          },
          removeAnswer: (questionId, answerId) =>
            set((state) => {
              const { questions } = state.research;
              const question = questions.find((q) => q.id === questionId);
              if (question && 'answers' in question) {
                question.answers = question.answers.filter((a) => a.id !== answerId);
              }
            }),
          moveAnswer: (questionId, event) =>
            set((state) => {
              const { questions } = state.research;
              const questionIndex = questions.findIndex((q) => q.id === questionId);
              const question = questions[questionIndex];

              if (question && 'answers' in question) {
                question.answers = move(question.answers, event);
              }
            }),
        },
      })),
    ),
  ),
);

export const useEditPageActions = () => useEditPageStore((state) => state.actions);

export const useFieldController = <T extends Path<Fields>>(path: T) => {
  const value = useEditPageStore((state) => _get(state, path));
  const {
    form: { getFieldValue, setFieldValue, registerField, unregisterField },
  } = useEditPageActions();

  const ref = useRef<{ focus: VoidFunction; scrollIntoView: VoidFunction } | null>(null);

  const setRef = useCallback((handle: { focus: VoidFunction; scrollIntoView: VoidFunction }) => {
    ref.current = handle;
  }, []);

  useEffect(() => {
    if (ref.current) {
      const questionIdPath = getQuestionIdPathFromPath(path);
      const answerIdPath = getAnswerIdPathFromPath(path);

      const questionId = questionIdPath ? getFieldValue(questionIdPath) : undefined;
      const answerId = answerIdPath ? getFieldValue(answerIdPath) : undefined;

      registerField(
        path,
        {
          focus: () => ref.current?.focus(),
          scrollIntoView: () => ref.current?.scrollIntoView(),
        },
        questionId,
        answerId,
      );
    }

    return () => unregisterField(path);
  }, [path]);

  return {
    value,
    onChange: (value: FieldPathValue<Fields, T> | ((value: FieldPathValue<Fields, T>) => FieldPathValue<Fields, T>)) => {
      if (isFunction(value)) {
        setFieldValue(path, value(getFieldValue(path)));
      } else {
        setFieldValue(path, value);
      }
    },
    getCurrentValue: () => getFieldValue(path),
    ref: setRef,
  };
};

export const useFieldWatch = <T extends Path<Fields>>(path: T) => {
  const value = useEditPageStore((state) => _get(state, path));
  return value;
};

function getQuestionIdPathFromPath(path: string): `research.questions.${number}.id` | null {
  const [, match] = path.match(/(research\.data\.questions\.\d+).?/) ?? [];
  return match ? (`${match}.id` as `research.questions.${number}.id`) : null;
}

function getAnswerIdPathFromPath(path: string): `research.questions.${number}.answers.${number}.id` | null {
  const [, match] = path.match(/(research\.data\.questions\.\d+\.answers\.\d+).?/) ?? [];
  return match ? (`${match}.id` as `research.questions.${number}.answers.${number}.id`) : null;
}
