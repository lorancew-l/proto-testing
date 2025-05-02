import { range } from 'lodash';

import { RatingQuestion as RatingQuestionType } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { InlineRichEditor } from '../inline-rich-editor';
import { useFieldController } from '../store';

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
  ratingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(0.5),
  },
  rating: {
    padding: theme.spacing(1.5),
    border: `1px solid #d5d6da`,
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.common.white,
    borderRadius: theme.shape.borderRadius,
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
          <div key={rating} className={classes.rating}>
            {rating}
          </div>
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
  const { value = '', onChange } = useFieldController(path);
  return <InlineRichEditor value={value} onChange={onChange} placeholder={placeholder} />;
};
