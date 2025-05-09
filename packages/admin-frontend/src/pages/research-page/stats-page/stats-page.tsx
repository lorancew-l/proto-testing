import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { range } from 'lodash';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PercentIcon from '@mui/icons-material/Percent';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Skeleton, Typography } from '@mui/material';

import { generateQuestion } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { useGetPublishedResearchRequest, useGetResearchStatsRequest } from '../../../api';

import { FilterSidebar } from './filter-sidebar';
import { QuestionStats } from './question-stats';
import { SessionSidebar } from './session-sidebar';
import { formatTimeMinAndSec } from './utils';

const useStyles = makeStyles()((theme) => ({
  container: {
    padding: theme.spacing(3),
    display: 'flex',
    flexWrap: 'nowrap',
    gap: theme.spacing(4),
    justifyContent: 'space-between',
    height: `calc(100vh - 44px)`,
    maxHeight: `calc(100vh - 44px)`,
    overflow: 'auto',
  },
  content: {
    margin: '0 auto',
    width: 650,
    padding: theme.spacing(3, 0),
  },
  generalStats: {
    display: 'flex',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(3),
  },
  generalStatsItemSkeleton: {
    height: 64,
    flexGrow: 1,
    borderRadius: theme.shape.borderRadius * 4,
    transform: 'none',
  },
  generalStatsItem: {
    flexGrow: 1,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.common.white,
    borderRadius: theme.shape.borderRadius * 4,
    border: `1px solid #d5d6da`,
  },
  metric: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  metricIcon: {
    color: theme.palette.grey['500'],
  },
  metricName: {
    color: theme.palette.action.active,
  },
  list: {
    all: 'unset',
    appearance: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
  },
}));

const skeletonQuestions = range(5).map(() => generateQuestion('single'));

export const StatsPage = ({ isLoading }: { isLoading: boolean }) => {
  const { classes } = useStyles();

  const { isLoading: dataLoading, data: publishedResearch, getPublishedResearch } = useGetPublishedResearchRequest();
  const { isLoading: statsLoading, data: stats, getResearchStats } = useGetResearchStatsRequest();

  const questions = useMemo(() => publishedResearch?.data.questions ?? [], [publishedResearch]);

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const loading = isLoading || statsLoading || dataLoading;

  const params = useParams<{ id?: string }>();
  const researchId = params.id;

  const handleSelectSession = (sessionId: string | null) => {
    setSelectedSessionId((prev) => (prev === sessionId ? null : sessionId));
  };

  useEffect(() => {
    if (researchId) {
      getPublishedResearch(researchId);
    }
  }, [researchId]);

  useEffect(() => {
    if (researchId) {
      getResearchStats(researchId, selectedSessionId);
    }
  }, [researchId, selectedSessionId]);

  return (
    <div className={classes.container}>
      <SessionSidebar
        isLoading={isLoading}
        sessions={stats?.sessions ?? []}
        selectedSessionId={selectedSessionId}
        onSelectSession={handleSelectSession}
      />

      <section className={classes.content}>
        <header className={classes.generalStats}>
          <GeneralStatsItem loading={loading} icon={<VisibilityIcon />} metric={stats?.load ?? 0} text="Показы" />

          <GeneralStatsItem loading={loading} icon={<AssignmentIcon />} metric={stats?.start ?? 0} text="Прохождения" />

          <GeneralStatsItem loading={loading} icon={<AssignmentTurnedInIcon />} metric={stats?.finish ?? 0} text="Завершили" />

          <GeneralStatsItem
            loading={loading}
            icon={<PercentIcon />}
            metric={Math.floor(((stats?.finish ?? 0) / (stats?.start ?? 1)) * 100)}
            text="Завершаемость"
          />

          <GeneralStatsItem
            loading={loading}
            icon={<AccessTimeIcon />}
            metric={formatTimeMinAndSec(stats?.avgSessionTime ?? 0)}
            text="Сред. время"
          />
        </header>

        <ol className={classes.list}>
          {loading &&
            skeletonQuestions.map((question) => (
              <Skeleton sx={{ transform: 'none', borderRadius: 4 }} key={question.id} width="100%" height={300} />
            ))}

          {!loading &&
            !!stats &&
            questions.map((question, index) => (
              <QuestionStats key={question.id} question={question} index={index} stats={stats?.answers ?? {}} />
            ))}
        </ol>
      </section>

      <FilterSidebar isLoading={isLoading} />
    </div>
  );
};

const GeneralStatsItem = ({
  icon,
  metric,
  text,
  loading,
}: {
  icon: React.ReactNode;
  metric: string | number | undefined;
  text: string;
  loading: boolean;
}) => {
  const { classes } = useStyles();

  if (loading) return <Skeleton className={classes.generalStatsItemSkeleton} />;

  return (
    <div className={classes.generalStatsItem}>
      <div className={classes.metric}>
        <div className={classes.metricIcon}>{icon}</div>

        <Typography variant="body1" fontWeight="bold">
          {metric}
        </Typography>
      </div>

      <Typography className={classes.metricName}>{text}</Typography>
    </div>
  );
};
