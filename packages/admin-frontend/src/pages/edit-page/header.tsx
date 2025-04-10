import { useNavigate } from 'react-router';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import { useEditPageActions, useEditPageStore } from './store';

const useStyles = makeStyles()((theme) => ({
  header: {
    height: 44,
    padding: theme.spacing(0, 1.5),
    backgroundColor: theme.palette.common.white,
    border: `1px solid #d5d6da`,
    display: 'flex',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 0,
    width: 32,
    height: 44,
    '&:hover': {
      opacity: 0.7,
    },
  },
  sections: {
    paddingRight: 32,
    display: 'flex',
    justifyContent: 'center',
    flexGrow: 1,
  },
  section: {
    all: 'unset',
    cursor: 'pointer',
    height: 41,
    '&:not(:last-child)': {
      marginRight: theme.spacing(3),
    },
    '&:hover': {
      opacity: 0.7,
    },
    borderBottom: `2px solid transparent`,
  },
  selected: {
    borderColor: theme.palette.primary.light,
  },
}));

const sections = [
  {
    value: 'research',
    name: 'Исследование',
  },
  {
    value: 'preview',
    name: 'Превью',
  },
  {
    value: 'publish',
    name: 'Публикация',
  },
  {
    value: 'stats',
    name: 'Отчет',
  },
] as const;

export const Header = () => {
  const { classes, cx } = useStyles();
  const navigate = useNavigate();

  const section = useEditPageStore((state) => state.section);
  const { setSection } = useEditPageActions();

  const navigateToMainPage = () => navigate('/researches');

  return (
    <header className={classes.header}>
      <IconButton className={classes.backButton} onClick={navigateToMainPage} disableRipple>
        <ArrowBackIcon fontSize="large" />
      </IconButton>

      <div className={classes.sections}>
        {sections.map(({ name, value }) => (
          <button
            key={value}
            className={cx(classes.section, { [classes.selected]: section === value })}
            onClick={() => setSection(value)}
          >
            {name}
          </button>
        ))}
      </div>
    </header>
  );
};
