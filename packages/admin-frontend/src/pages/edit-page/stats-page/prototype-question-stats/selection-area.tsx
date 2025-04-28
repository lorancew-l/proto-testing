import AdsClickIcon from '@mui/icons-material/AdsClick';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ModeStandbyIcon from '@mui/icons-material/ModeStandby';
import PersonIcon from '@mui/icons-material/Person';
import { Typography, alpha } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import { getRelativeRectStyle } from '../../common';

import { SelectionArea as SelectionAreaType } from './use-selection-areas';

const useStyles = makeStyles()((theme) => ({
  area: {
    border: `1px solid ${theme.palette.primary.main}`,
    backgroundColor: alpha(theme.palette.primary.light, 0.3),
    borderRadius: theme.shape.borderRadius * 2,
    cursor: 'pointer',
    zIndex: theme.zIndex.modal,
  },
  areaPreview: {
    borderStyle: 'dashed',
    cursor: 'inherit',
  },
  areaStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    padding: theme.spacing(1),
  },
  areaStat: {
    width: 'fit-content',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'nowrap',
    whiteSpace: 'nowrap',
    gap: theme.spacing(0.5),
    padding: theme.spacing(0, 0.5),
    backgroundColor: theme.palette.primary.light,
    borderRadius: theme.shape.borderRadius * 1.5,
    color: theme.palette.common.white,
    lineHeight: '16px',
  },
  icon: {
    color: theme.palette.common.white,
  },
  percent: {
    color: alpha(theme.palette.common.white, 0.5),
  },
}));

export const SelectionArea = ({
  area,
  stats,
  onClick,
}: {
  area: SelectionAreaType;
  stats: {
    respondentCount: number;
    totalRespondentCount: number;
    clickCount: number;
    misclickCount: number;
    targetClickCount: number;
  };
  onClick: (areaId: string) => void;
}) => {
  const { classes } = useStyles();

  return (
    <div
      key={area.id}
      style={getRelativeRectStyle(area)}
      className={classes.area}
      onClick={(event) => {
        event.stopPropagation();
        onClick(area.id);
      }}
    >
      <div className={classes.areaStats}>
        <AreaStat title="Клики" Icon={AdsClickIcon} count={stats.clickCount} />

        <AreaStat title="Промахи" Icon={HighlightOffIcon} count={stats.misclickCount} from={stats.clickCount} />

        <AreaStat title="Попадания" Icon={ModeStandbyIcon} count={stats.targetClickCount} from={stats.clickCount} />

        <AreaStat title="Респонденты" Icon={PersonIcon} count={stats.respondentCount} from={stats.totalRespondentCount} />
      </div>
    </div>
  );
};

const AreaStat = ({ title, Icon, count, from }: { title: string; Icon: typeof PersonIcon; count: number; from?: number }) => {
  const { classes } = useStyles();
  return (
    <div className={classes.areaStat}>
      <Icon className={classes.icon} fontSize="small" />

      <Typography>
        <Typography sx={{ marginRight: 0.5 }} fontSize={12} component="span">
          {`${title}: ${count}`}
        </Typography>

        {from !== undefined && (
          <Typography fontSize={12} component="span" className={classes.percent}>
            {`(${from ? Math.floor((count / from) * 100) : 0}%)`}
          </Typography>
        )}
      </Typography>
    </div>
  );
};

export const AreaPreview = ({ area }: { area: Omit<SelectionAreaType, 'id'> }) => {
  const { classes, cx } = useStyles();
  return <div style={getRelativeRectStyle(area)} className={cx(classes.area, classes.areaPreview)} />;
};
