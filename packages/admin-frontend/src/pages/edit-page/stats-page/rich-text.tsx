import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(() => ({
  text: {
    '& p': {
      margin: 0,
    },
  },
}));

export const RichText = ({ text, className }: { text: string; className?: string }) => {
  const { classes, cx } = useStyles();
  return <div className={cx(classes.text, className)} dangerouslySetInnerHTML={{ __html: text }} />;
};
