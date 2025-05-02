import React from 'react';

import { range } from 'lodash';

import StarBorderIcon from '@mui/icons-material/StarBorder';

import { RatingQuestion as RatingQuestionType } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { useFieldController } from '../../store';
import { InlineRichEditor } from '../inline-rich-editor';

const useStyles = makeStyles()((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  labels: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    '& > *': {
      flexShrink: 0,
      minWidth: 0,
      maxWidth: `calc((100% - ${theme.spacing(2)}) / 2)`,
    },
  },
  label: {
    color: theme.palette.action.active,
  },
  ratingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(0.5),
  },
  ratingDigit: {
    padding: theme.spacing(1.5),
    border: `1px solid #d5d6da`,
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.common.white,
    borderRadius: theme.shape.borderRadius,
  },
  ratingStar: {
    width: 36,
    height: 36,
  },
}));

export const RatingQuestion = ({ question, index }: { question: RatingQuestionType; index: number }) => {
  const { classes } = useStyles();

  const ratingRange = range(question.min, question.max + 1);

  return (
    <div className={classes.container}>
      <div className={classes.labels}>
        <ScaleLabel path={`research.questions.${index}.minLabel`} placeholder="Подпись в начале" />
        <ScaleLabel path={`research.questions.${index}.maxLabel`} placeholder="Подпись в конце" />
      </div>

      <div className={classes.ratingContainer}>
        {ratingRange.map((rating) => (
          <React.Fragment key={rating}>
            {question.preset === 'digits' && <div className={classes.ratingDigit}>{rating}</div>}

            {question.preset === 'stars' && <StarBorderIcon key={rating} className={classes.ratingStar} color="action" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const ScaleLabel = ({
  path,
  placeholder,
}: {
  path: `research.questions.${number}.minLabel` | `research.questions.${number}.maxLabel`;
  placeholder: string;
}) => {
  const { classes } = useStyles();
  const { value = '', onChange } = useFieldController(path);
  return <InlineRichEditor className={classes.label} value={value} onChange={onChange} placeholder={placeholder} />;
};
