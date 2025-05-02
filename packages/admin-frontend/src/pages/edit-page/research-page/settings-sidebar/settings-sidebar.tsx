import { range } from 'lodash';

import { Typography } from '@mui/material';

import { Question } from 'shared';
import { makeStyles } from 'tss-react/mui';
import { useShallow } from 'zustand/react/shallow';

import { useEditPageStore } from '../../store';
import { Sidebar } from '../sidebar';

import { ChipSelect } from './chip-select';
import { FormSelect } from './form-select';
import { FormSwitchInput } from './form-switch-input';
import { FormTextInput } from './form-text-input';

const useStyles = makeStyles()((theme) => ({
  settings: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
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

  return <QuestionSettings path={path} />;
};

const SingleQuestionSettings = ({ path }: QuestionSettingsProps) => {
  return (
    <>
      <FormSwitchInput path={`${path}.requiresAnswer`} label="Обязательный вопрос" />
    </>
  );
};

const MultipleQuestionSettings = ({ path }: QuestionSettingsProps) => {
  return (
    <>
      <FormSwitchInput path={`${path}.requiresAnswer`} label="Обязательный вопрос" />
    </>
  );
};

const ratingPresetOptions = [
  { value: 'stars', label: 'Звезды' },
  { value: 'digits', label: 'Цифры' },
];
const ratingMinOptions = range(0, 2).map((value) => ({ value, label: value.toString() }));
const ratingMaxOptions = range(5, 11).map((value) => ({ value, label: value.toString() }));
const RatingQuestionSettings = ({ path }: QuestionSettingsProps) => {
  const { classes } = useStyles();

  return (
    <>
      <FormSwitchInput path={`${path}.requiresAnswer`} label="Обязательный вопрос" />

      <ChipSelect path={`${path}.preset`} options={ratingPresetOptions} />

      <div className={classes.twoColumnSetting}>
        <FormSelect path={`${path}.min`} label="от" options={ratingMinOptions} />

        <FormSelect path={`${path}.max`} label="до" options={ratingMaxOptions} />
      </div>
    </>
  );
};

const PrototypeQuestionSettings = ({ path }: QuestionSettingsProps) => {
  return (
    <>
      <FormSwitchInput path={`${path}.requiresAnswer`} label="Обязательный вопрос" />
    </>
  );
};

type QuestionSettingsProps = { path: `research.questions.${number}` };
export const questionTypeToSettings: Record<Question['type'], React.ComponentType<QuestionSettingsProps>> = {
  single: SingleQuestionSettings,
  multiple: MultipleQuestionSettings,
  rating: RatingQuestionSettings,
  prototype: PrototypeQuestionSettings,
};
