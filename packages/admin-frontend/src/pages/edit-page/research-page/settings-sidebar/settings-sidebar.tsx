import { range } from 'lodash';

import { Typography } from '@mui/material';

import { Question } from 'shared';
import { makeStyles } from 'tss-react/mui';
import { useShallow } from 'zustand/react/shallow';

import { useEditPageStore } from '../../store';
import { Sidebar } from '../sidebar';

import { ChipSelect } from './chip-select';
import { DisplayRule } from './display-rule';
import { FormNumberInput } from './form-number-input';
import { FormSelect } from './form-select';
import { FormSwitchInput } from './form-switch-input';
import { FormTextInput } from './form-text-input';
import { LabeledSetting } from './labeled-setting';

const useStyles = makeStyles()((theme) => ({
  settings: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  twoColumnSetting: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(0.5),
  },
}));

export const SettingsSidebar = ({ isLoading }: { isLoading: boolean }) => {
  const { classes } = useStyles();
  const activeEntity = useEditPageStore((state) => state.activeEntity);

  return (
    <Sidebar isLoading={isLoading} onClick={(event) => event.stopPropagation()}>
      <Typography variant="h6">Настройки</Typography>

      <div className={classes.settings}>
        {activeEntity.type === 'research' && <ResearchSettings />}

        {activeEntity.type === 'question' && (
          <QuestionSettings key={activeEntity.questionId} questionId={activeEntity.questionId} />
        )}
      </div>
    </Sidebar>
  );
};

const ResearchSettings = () => {
  return (
    <>
      <FormTextInput path="researchMetadata.name" label="Название исследования" />
    </>
  );
};

const QuestionSettings = ({ questionId }: { questionId: string }) => {
  const question = useEditPageStore(
    useShallow((state) => {
      const index = state.research.questions.findIndex((q) => q.id === questionId);
      const question = state.research.questions[index];
      if (!question) return null;

      return { index, type: question.type };
    }),
  );

  if (!question) return;

  const QuestionSettings = questionTypeToSettings[question.type];
  const path = `research.questions.${question.index}` as const;

  return <QuestionSettings path={path} questionIndex={question.index} />;
};

const SingleQuestionSettings = ({ path, questionIndex }: QuestionSettingsProps) => {
  return (
    <>
      <FormSwitchInput path={`${path}.requiresAnswer`} label="Обязательный вопрос" />

      <DisplayRule path={path} questionIndex={questionIndex} />
    </>
  );
};

const MultipleQuestionSettings = ({ path, questionIndex }: QuestionSettingsProps) => {
  return (
    <>
      <FormSwitchInput path={`${path}.requiresAnswer`} label="Обязательный вопрос" />

      <DisplayRule path={path} questionIndex={questionIndex} />
    </>
  );
};

const ratingPresetOptions = [
  { value: 'stars', label: 'Звезды' },
  { value: 'digits', label: 'Цифры' },
];
const ratingMinOptions = range(0, 2).map((value) => ({ value, label: value.toString() }));
const ratingMaxOptions = range(5, 11).map((value) => ({ value, label: value.toString() }));
const RatingQuestionSettings = ({ path, questionIndex }: QuestionSettingsProps) => {
  const { classes } = useStyles();

  return (
    <>
      <FormSwitchInput path={`${path}.requiresAnswer`} label="Обязательный вопрос" />

      <LabeledSetting label="Тип рейтинга">
        <ChipSelect path={`${path}.preset`} options={ratingPresetOptions} />
      </LabeledSetting>

      <LabeledSetting label="Диапазон рейтинга">
        <div className={classes.twoColumnSetting}>
          <FormSelect path={`${path}.min`} label="от" options={ratingMinOptions} />

          <FormSelect path={`${path}.max`} label="до" options={ratingMaxOptions} />
        </div>
      </LabeledSetting>

      <DisplayRule path={path} questionIndex={questionIndex} />
    </>
  );
};

const FreeTextQuestionSettings = ({ path, questionIndex }: QuestionSettingsProps) => {
  return (
    <>
      <FormSwitchInput path={`${path}.requiresAnswer`} label="Обязательный вопрос" />

      <LabeledSetting label="Ограничение символов">
        <FormNumberInput path={`${path}.textLimit`} min={50} max={2000} fullWidth />
      </LabeledSetting>

      <DisplayRule path={path} questionIndex={questionIndex} />
    </>
  );
};

const PrototypeQuestionSettings = ({ path, questionIndex }: QuestionSettingsProps) => {
  return (
    <>
      <FormSwitchInput path={`${path}.requiresAnswer`} label="Обязательный вопрос" />

      <DisplayRule path={path} questionIndex={questionIndex} />
    </>
  );
};

type QuestionSettingsProps = { path: `research.questions.${number}`; questionIndex: number };
export const questionTypeToSettings: Record<Question['type'], React.ComponentType<QuestionSettingsProps>> = {
  single: SingleQuestionSettings,
  multiple: MultipleQuestionSettings,
  rating: RatingQuestionSettings,
  'free-text': FreeTextQuestionSettings,
  prototype: PrototypeQuestionSettings,
};
