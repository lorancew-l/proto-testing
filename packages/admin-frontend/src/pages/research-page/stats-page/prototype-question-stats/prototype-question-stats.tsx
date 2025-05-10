import React, { forwardRef, useMemo, useState } from 'react';

import DoDisturbAltIcon from '@mui/icons-material/DoDisturbAlt';
import DoneIcon from '@mui/icons-material/Done';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonIcon from '@mui/icons-material/Person';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import { Dialog, Slide, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { PrototypeQuestion, PrototypeScreen } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { RichText } from '../../rich-text';
import { QuestionStatsCard } from '../question-stats-card';
import type { PrototypeQuestionSessionStats, PrototypeQuestionStats as PrototypeQuestionStatsType } from '../types';
import { formatTimeMinAndSec } from '../utils';

import { PrototypeScreenStats } from './prototype-screen-stats';

const useStyles = makeStyles<void, 'compactPreview'>()((theme, _, classes) => ({
  questionWrapper: {
    appearance: 'none',
    listStyleType: 'none',
    width: '100%',
    boxSizing: 'border-box',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.common.white,
    borderRadius: theme.shape.borderRadius * 4,
    border: '1px solid #d5d6da',
  },
  screenPreviewList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1.5),
  },
  screenPreview: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    cursor: 'pointer',
    width: 96,
    [`&.${classes.compactPreview}`]: {
      width: 40,
      height: 40,
    },
  },
  compactPreview: {},
  screenPreviewImage: {
    border: '1px solid #d5d6da',
    borderRadius: theme.shape.borderRadius * 2,
    width: 96,
    height: 96,
    objectFit: 'contain',
    backgroundColor: theme.palette.grey[100],
    '&:hover': {
      outline: `2px solid ${theme.palette.primary.light}`,
    },
    [`.${classes.compactPreview} &`]: {
      width: 40,
      height: 40,
    },
  },
  screenPreviewDescription: {
    color: theme.palette.action.active,
    wordWrap: 'break-word',
  },
  generalStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gridTemplateRows: 'auto',
    gap: theme.spacing(2),
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },
  generalStatsStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
  },
  tabs: {
    display: 'flex',
    flexGrow: 1,
    marginBottom: theme.spacing(2),
  },
  tab: {
    all: 'unset',
    cursor: 'pointer',
    height: 30,
    boxSizing: 'border-box',
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
  sessionStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  sessionScreens: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
  },
  completed: {
    color: theme.palette.success.main,
  },
  givenUp: {
    color: theme.palette.warning.main,
  },
}));

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const PrototypeQuestionStats = ({
  question,
  index,
  stats = {
    general: {
      total: { count: 0, avgTime: 0, medianTime: 0 },
      completed: { count: 0, avgTime: 0, medianTime: 0 },
      givenUp: { count: 0, avgTime: 0, medianTime: 0 },
      screenTime: {},
    },
    sessions: [],
  },
}: {
  question: PrototypeQuestion;
  index: number;
  stats: PrototypeQuestionStatsType | undefined;
}) => {
  const { classes, cx } = useStyles();

  const [selectedState, setSelectedState] = useState<{ screenId: string; ssid?: string; sessionId?: string } | null>(null);
  const [statsType, setStatsType] = useState<'screen' | 'session'>('screen');

  const screenMap = useMemo(() => {
    return new Map<string, PrototypeScreen>(question.screens.map((screen) => [screen.id, screen]));
  }, [question.screens]);

  const screens = useMemo((): (PrototypeScreen & { ssid?: string })[] => {
    const session = selectedState?.sessionId ? stats.sessions.find((session) => session.id === selectedState.sessionId) : null;
    if (!session) return question.screens;
    return session.answers.map((answer) => ({ ...screenMap.get(answer.screenId)!, ssid: answer.ssid }));
  }, [question.screens, stats, selectedState?.sessionId]);

  const handleScreenStatsClose = () => {
    setSelectedState(null);
  };

  return (
    <>
      <QuestionStatsCard question={question} index={index}>
        {question.description && <RichText text={question.description} />}

        <Typography variant="h6" sx={{ marginBottom: 1, marginTop: 1.5, fontSize: 16 }}>
          Обобщенные результаты
        </Typography>

        <Typography variant="body2" color="action.active" sx={{ marginBottom: 1.5 }}>
          Агрегированная статистика по всем прохождениям
        </Typography>

        <GeneralStats
          rows={[
            {
              ...stats.general.total,
              title: 'Всего',
              icon: <PeopleAltIcon sx={{ color: 'action.active' }} />,
            },
            {
              ...stats.general.completed,
              title: 'Успешно',
              icon: <PersonIcon color="success" />,
              from: stats.general.total.count,
            },
            {
              ...stats.general.givenUp,
              title: 'Сдалось',
              icon: <PersonOffIcon color="warning" />,
              from: stats.general.total.count,
            },
          ]}
        />

        <Typography variant="h6" sx={{ marginBottom: 1, fontSize: 16 }}>
          Тепловые карты
        </Typography>

        <Typography variant="body2" color="action.active" sx={{ marginBottom: 1.5 }}>
          Просмотр статистики кликов по конкретному экрану или прохождению
        </Typography>

        <div className={classes.tabs}>
          {[{ name: 'По экранам', value: 'screen' } as const, { name: 'По прохождениям', value: 'session' } as const].map(
            ({ name, value }) => (
              <button
                key={value}
                className={cx(classes.tab, { [classes.selected]: value === statsType })}
                onClick={() => setStatsType(value)}
              >
                {name}
              </button>
            ),
          )}
        </div>

        {statsType === 'screen' && (
          <PerScreenStats question={question} onSelectScreen={(screenId) => setSelectedState({ screenId })} />
        )}

        {statsType === 'session' && (
          <PerSessionStats screenMap={screenMap} sessions={stats.sessions} onSelectSession={setSelectedState} />
        )}
      </QuestionStatsCard>

      <Dialog open={!!selectedState} onClose={handleScreenStatsClose} TransitionComponent={Transition} fullScreen>
        <PrototypeScreenStats
          key={String(!!selectedState?.sessionId)}
          stats={stats}
          screens={screens}
          selectedState={selectedState}
          onClose={handleScreenStatsClose}
          onScreenSelect={(state) => setSelectedState((prev) => ({ ...prev, ...state }))}
        />
      </Dialog>
    </>
  );
};

const GeneralStats = ({
  rows,
}: {
  rows: {
    count: number;
    title: string;
    from?: number;
    avgTime: number;
    medianTime: number;
    icon: React.ReactNode;
  }[];
}) => {
  const { classes } = useStyles();

  return (
    <div className={classes.generalStats}>
      <Typography color="action.active">Статус</Typography>
      <Typography color="action.active">Количество</Typography>
      <Typography color="action.active">Среднее время</Typography>
      <Typography color="action.active">Медианное время</Typography>

      {rows.map(({ title, icon, count, from, avgTime, medianTime }) => (
        <React.Fragment key={title}>
          <div className={classes.generalStatsStatus}>
            {icon}

            <Typography color="action.active">{title}</Typography>
          </div>

          <Typography>
            <Typography sx={{ marginRight: 0.5 }} fontWeight="bold" fontSize={16} component="span">
              {count}
            </Typography>

            {from !== undefined && (
              <Typography color="action.active" fontSize={16} component="span">
                {`(${from ? Math.floor((count / from) * 100) : 0}%)`}
              </Typography>
            )}
          </Typography>

          <Typography fontWeight="bold" fontSize={16}>
            {formatTimeMinAndSec(avgTime)}
          </Typography>

          <Typography fontWeight="bold" fontSize={16}>
            {formatTimeMinAndSec(medianTime)}
          </Typography>
        </React.Fragment>
      ))}
    </div>
  );
};

const PerScreenStats = ({
  question,
  onSelectScreen,
}: {
  question: PrototypeQuestion;
  onSelectScreen: (screenId: string) => void;
}) => {
  const { classes } = useStyles();

  return (
    <div className={classes.screenPreviewList}>
      {question.screens.map((screen) => (
        <ScreenPreviewCard key={screen.id} screen={screen} onClick={onSelectScreen} />
      ))}
    </div>
  );
};

const ScreenPreviewCard = ({
  screen,
  onClick,
  variant = 'default',
}: {
  screen: PrototypeScreen;
  variant?: 'default' | 'compact';
  onClick: (screenId: string) => void;
}) => {
  const { classes, cx } = useStyles();

  return (
    <div
      className={cx(classes.screenPreview, { [classes.compactPreview]: variant === 'compact' })}
      role="button"
      onClick={() => onClick(screen.id)}
    >
      <img className={classes.screenPreviewImage} src={screen.data.imageSrc} />

      {variant === 'default' && (
        <span className={classes.screenPreviewDescription}>
          <RichText text={screen.data.description} />
        </span>
      )}
    </div>
  );
};

const PerSessionStats = ({
  sessions,
  screenMap,
  onSelectSession,
}: {
  sessions: PrototypeQuestionSessionStats[];
  screenMap: Map<string, PrototypeScreen>;
  onSelectSession: (state: { ssid?: string; sessionId: string; screenId: string }) => void;
}) => {
  return (
    <TableContainer component="div">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="left" padding="none">
              Дата
            </TableCell>
            <TableCell align="left">Статус</TableCell>
            <TableCell align="left">Время</TableCell>
            <TableCell align="left">Экраны</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sessions.map((session) => (
            <SessionStats key={session.id} session={session} screenMap={screenMap} onSelectSession={onSelectSession} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const SessionStats = ({
  session,
  screenMap,
  onSelectSession,
}: {
  screenMap: Map<string, PrototypeScreen>;
  session: PrototypeQuestionSessionStats;
  onSelectSession: (state: { ssid?: string; sessionId: string; screenId: string }) => void;
}) => {
  const { classes, cx } = useStyles();

  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell component="th" scope="row" padding="none" sx={{ whiteSpace: 'nowrap' }}>
        {format(new Date(session.startTs), 'd MMMM, HH:mm', { locale: ru })}
      </TableCell>
      <TableCell align="left" sx={{ whiteSpace: 'nowrap' }}>
        <span
          className={cx(classes.sessionStatus, { [classes.completed]: session.completed, [classes.givenUp]: session.givenUp })}
        >
          {session.completed ? <DoneIcon color="success" /> : <DoDisturbAltIcon color="warning" />}
          {session.completed ? 'Успешно' : 'Сдался'}
        </span>
      </TableCell>
      <TableCell align="left" sx={{ whiteSpace: 'nowrap' }}>
        {formatTimeMinAndSec(session.endTs - session.startTs)}
      </TableCell>
      <TableCell align="left">
        <div className={classes.sessionScreens}>
          {session.answers.map(({ screenId, ssid }) => {
            const screen = screenMap.get(screenId);
            return screen ? (
              <ScreenPreviewCard
                screen={screen}
                variant="compact"
                onClick={(screenId) => onSelectSession({ sessionId: session.id, screenId, ssid })}
              />
            ) : null;
          })}
        </div>
      </TableCell>
    </TableRow>
  );
};
