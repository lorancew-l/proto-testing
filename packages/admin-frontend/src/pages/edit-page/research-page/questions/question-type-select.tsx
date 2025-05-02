import { useState } from 'react';

import { alpha } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import { Question } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { questionTypeToIcon } from '../../common';
import { useEditPageActions } from '../../store';

const typeToTitle: Record<Question['type'], string> = {
  single: 'Одиночный выбор',
  multiple: 'Множественный выбор',
  rating: 'Рейтинг',
  prototype: 'Тестирование прототипа',
};

const useStyles = makeStyles()((theme) => ({
  container: {
    all: 'unset',
    width: 18,
    height: 18,
    borderRadius: theme.shape.borderRadius * 1.5,
    backgroundColor: theme.palette.primary.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  icon: {
    color: theme.palette.common.white,
    width: 14,
    height: 14,
  },
  menu: {
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: 'rgb(55, 65, 81)',
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-paper': {
      borderRadius: theme.shape.borderRadius * 2,
    },
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      padding: theme.spacing(1),
      '&:active': {
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
      },
    },
  },
  menuIcon: {
    color: theme.palette.primary.main,
    width: 18,
    height: 18,
    marginRight: theme.spacing(1),
  },
}));

export const QuestionTypeSelect = ({ id, type }: { id: string; type: Question['type'] }) => {
  const { classes } = useStyles();

  const { changeQuestionType } = useEditPageActions();

  const Icon = questionTypeToIcon[type];

  const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElement(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorElement(null);
  };

  const handleTypeSelect = (type: Question['type']) => {
    changeQuestionType(id, type);
    handleClose();
  };

  return (
    <>
      <button className={classes.container} onClick={handleClick}>
        <Icon className={classes.icon} />
      </button>

      <Menu className={classes.menu} open={!!anchorElement} anchorEl={anchorElement} onClose={handleClose}>
        {Object.entries(questionTypeToIcon).map(([questionType, Icon]) => (
          <MenuItem
            key={questionType}
            onClick={() => handleTypeSelect(questionType as Question['type'])}
            selected={type === questionType}
            disableRipple
          >
            <Icon className={classes.menuIcon} />
            {typeToTitle[questionType as Question['type']]}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
