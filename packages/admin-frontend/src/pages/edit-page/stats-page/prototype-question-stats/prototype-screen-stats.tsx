import { forwardRef, useCallback, useMemo, useState } from 'react';

import { isNumber } from 'lodash';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import { Dialog, FormControlLabel, FormGroup, Slide, Switch, Typography } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';

import type { PrototypeScreen } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { RichText } from '../../rich-text';
import { PrototypeQuestionClickStats, PrototypeQuestionStats } from '../types';
import { formatTimeMinAndSec } from '../utils';

import { PrototypeClickMap } from './prototype-click-map';
import { PrototypeHeatMap } from './prototype-heat-map';
import { PrototypeScreenImage } from './prototype-screen-image';
import { AreaPreview, SelectionArea } from './selection-area';
import { SelectionArea as SelectionAreaType, useSelectionAreas } from './use-selection-areas';

const useStyles = makeStyles()((theme) => ({
  container: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.common.white,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1.5),
  },
  screenInfo: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 16,
  },
  screenDescription: {
    fontWeight: 'bold',
    marginRight: theme.spacing(0.5),
  },
  screenIndex: {
    color: theme.palette.action.active,
  },
  button: {
    all: 'unset',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    '&:hover': {
      opacity: 0.7,
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.4,
    },
  },
  content: {
    display: 'flex',
    gap: theme.spacing(2),
  },
  image: {
    borderRadius: theme.shape.borderRadius * 4,
    border: '1px solid #d5d6da',
    overflow: 'hidden',
    flexGrow: 1,
    height: 'calc(100vh - 126px)',
  },
  generalStats: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  metric: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 0),
    '&:not(:last-child)': {
      borderBottom: '1px solid #d5d6da',
      marginBottom: theme.spacing(1),
    },
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
  cursorPointer: {
    cursor: 'pointer',
  },
  cursorCrosshair: {
    cursor: 'crosshair',
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

type ScreenStats = {
  respondentCount: number;
  totalRespondentCount: number;
  clickCount: number;
  misclickCount: number;
  targetClickCount: number;
  clicks: PrototypeQuestionClickStats;
  screenTime: number | { avgTime: number; medianTime: number };
};

type StatsSettings = {
  onlyFirstClick: boolean;
  areaSelection: boolean;
  showClickOrder: boolean;
  showClickableArea: boolean;
};

type SettingChangeHandler = <T extends keyof StatsSettings>(setting: T, value: StatsSettings[T]) => void;

export const PrototypeScreenStats = ({
  stats,
  screens,
  selectedState,
  onClose,
  onScreenSelect,
}: {
  stats: PrototypeQuestionStats;
  screens: (PrototypeScreen & {
    ssid?: string;
  })[];
  selectedState: { screenId: string; ssid?: string; sessionId?: string } | null;
  onClose: VoidFunction;
  onScreenSelect(state: { ssid?: string; screenId: string }): void;
}) => {
  const { classes, cx } = useStyles();

  const [tab, setTab] = useState<'heatmap' | 'clickmap' | 'image'>(selectedState?.sessionId ? 'clickmap' : 'heatmap');
  const tabs = [
    ...(selectedState?.sessionId
      ? []
      : ([
          {
            value: 'heatmap',
            name: 'Тепловая карта',
          },
        ] as const)),
    {
      value: 'clickmap',
      name: 'Карта кликов',
    },
    {
      value: 'image',
      name: 'Изображение',
    },
  ] as const;

  const [statsSettings, setStatsSettings] = useState<StatsSettings>({
    onlyFirstClick: false,
    areaSelection: false,
    showClickOrder: false,
    showClickableArea: false,
  });

  const { screen, screenIndex } = useMemo(() => {
    const screenIndex = screens.findIndex((screen) =>
      selectedState?.ssid ? screen.ssid === selectedState.ssid : screen.id === selectedState?.screenId,
    );
    const screen = screens[screenIndex];
    return { screen, screenIndex };
  }, [selectedState?.screenId, screens]);

  const getScreenStats = useCallback(
    (area?: SelectionAreaType): ScreenStats => {
      if (!selectedState?.screenId)
        return {
          respondentCount: 0,
          totalRespondentCount: 0,
          clickCount: 0,
          misclickCount: 0,
          targetClickCount: 0,
          clicks: [],
          screenTime: { avgTime: 0, medianTime: 0 },
        };

      const sessions = selectedState.sessionId
        ? stats.sessions.filter((session) => session.id === selectedState.sessionId)
        : stats.sessions;

      let screenTime: number | { avgTime: number; medianTime: number };

      if (selectedState.ssid) {
        const [selectedSession] = sessions;
        const screenStats = selectedSession.answers.find((screen) => screen.ssid === selectedState.ssid);
        screenTime = screenStats ? screenStats.endTs - screenStats.startTs : 0;
      } else {
        screenTime = stats.general.screenTime[selectedState.screenId] ?? { avgTime: 0, medianTime: 0 };
      }

      const uniqSessions = new Set<string>();

      const clicks = sessions.flatMap((sessionStats) => {
        const sessionsClicks = sessionStats.answers.flatMap((screen) => {
          const isSelectedScreen = selectedState.ssid
            ? screen.ssid === selectedState.ssid
            : screen.screenId === selectedState.screenId;
          return isSelectedScreen
            ? screen.clicks.filter((click) => {
                return !area || isClickInArea(click, area);
              })
            : [];
        });

        if (sessionsClicks.length) uniqSessions.add(sessionStats.id);

        return statsSettings.onlyFirstClick ? (sessionsClicks[0] ?? []) : sessionsClicks;
      });

      const respondentCount = uniqSessions.size;
      const clickCount = clicks.length;
      const misclickCount = clicks.filter((click) => !click.areaId).length;
      const targetClickCount = clickCount - misclickCount;

      return {
        clicks,
        clickCount,
        misclickCount,
        targetClickCount,
        respondentCount,
        totalRespondentCount: sessions.length,
        screenTime,
      };
    },
    [selectedState, stats, statsSettings.onlyFirstClick],
  );

  const screenStats = useMemo(getScreenStats, [getScreenStats]);

  const { imageRef, areas, areaPreview, deleteArea } = useSelectionAreas({
    screenId: `${selectedState?.screenId}${tab}`,
    disabled: !statsSettings.areaSelection,
  });

  const moveToScreen = (index: number) => {
    const nextScreen = screens[index];
    if (nextScreen) onScreenSelect({ ssid: nextScreen.ssid, screenId: nextScreen.id });
  };

  const moveToNextScreen = () => {
    moveToScreen(screenIndex + 1);
  };

  const moveToPrevScreen = () => {
    moveToScreen(screenIndex - 1);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      moveToPrevScreen();
    }

    if (event.key === 'ArrowRight') {
      moveToNextScreen();
    }
  };

  const handleSettingChange: SettingChangeHandler = (setting, value) => {
    setStatsSettings((prev) => ({ ...prev, [setting]: value }));
  };

  const handleGoToScreenByClick = (screenId: string) => {
    if (!selectedState?.sessionId) {
      onScreenSelect({ screenId });
    }
  };

  const imageProps = {
    screen,
    screens,
    imageRef,
    clicks: screenStats.clicks,
    showAreas: statsSettings.showClickableArea,
    showClickOrder: statsSettings.showClickOrder,
    disableGoTo: statsSettings.areaSelection,
    onGoToScreen: handleGoToScreenByClick,
    className: cx({
      [classes.cursorPointer]: !selectedState?.sessionId && !statsSettings.areaSelection,
      [classes.cursorCrosshair]: !!statsSettings.areaSelection,
    }),
    children: (
      <>
        {areaPreview && <AreaPreview area={areaPreview} />}
        {areas.map((area) => (
          <SelectionArea key={area.id} area={area} stats={getScreenStats(area)} onClick={deleteArea} />
        ))}
      </>
    ),
  };

  return (
    <>
      <Dialog open={!!selectedState} onClose={onClose} TransitionComponent={Transition} fullScreen onKeyDown={handleKeyDown}>
        <div className={classes.container}>
          <header className={classes.header}>
            <div className={classes.screenInfo}>
              <button className={classes.button} onClick={moveToPrevScreen} disabled={screenIndex === 0}>
                <ChevronLeftIcon />
              </button>

              <RichText className={classes.screenDescription} text={screen?.data.description || 'Экран без названия'} />

              <span className={classes.screenIndex}>{`(${screenIndex + 1} из ${screens.length})`}</span>

              <button className={classes.button} onClick={moveToNextScreen} disabled={screenIndex === screens.length - 1}>
                <ChevronRightIcon />
              </button>
            </div>

            <button className={classes.button} onClick={onClose}>
              <CloseIcon />
            </button>
          </header>

          <div className={classes.tabs}>
            {tabs.map(({ name, value }) => (
              <button
                key={value}
                className={cx(classes.tab, { [classes.selected]: tab === value })}
                onClick={() => setTab(value)}
              >
                {name}
              </button>
            ))}
          </div>

          <div className={classes.content}>
            {screen && (
              <div className={classes.image}>
                {tab === 'heatmap' && <PrototypeHeatMap {...imageProps} />}
                {tab === 'clickmap' && <PrototypeClickMap {...imageProps} />}
                {tab === 'image' && <PrototypeScreenImage {...imageProps} />}
              </div>
            )}

            <PrototypeScreenGeneralStats
              config={{
                onlyFirstClick: true,
                showClickOrder: !!selectedState?.sessionId && tab === 'clickmap',
                showClickableArea: true,
                areaSelection: !selectedState?.sessionId,
              }}
              stats={screenStats}
              settings={statsSettings}
              onChangeSetting={handleSettingChange}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

const settingToLabel: Record<keyof StatsSettings, string> = {
  onlyFirstClick: 'Только первый клик',
  showClickOrder: 'Очередность кликов',
  showClickableArea: 'Показать целевые области',
  areaSelection: 'Выделение областей курсором',
};

const PrototypeScreenGeneralStats = ({
  config,
  settings,
  stats,
  onChangeSetting,
}: {
  config: Record<keyof StatsSettings, boolean>;
  settings: StatsSettings;
  stats: ScreenStats;
  onChangeSetting: SettingChangeHandler;
}) => {
  const { classes } = useStyles();

  return (
    <div className={classes.generalStats}>
      <div>
        <Metric label="Респонденты" value={stats.totalRespondentCount} />
        <Metric label="Клики" value={stats.clickCount} />
        <Metric label="Промахи" value={stats.misclickCount} from={stats.clickCount} />
        <Metric label="Попадания" value={stats.targetClickCount} from={stats.clickCount} />

        {isNumber(stats.screenTime) ? (
          <Metric label="Время на экране" value={formatTimeMinAndSec(stats.screenTime)} />
        ) : (
          <>
            <Metric label="Среднее время" value={formatTimeMinAndSec(stats.screenTime.avgTime)} />
            <Metric label="Медианное время" value={formatTimeMinAndSec(stats.screenTime.medianTime)} />
          </>
        )}
      </div>

      <FormGroup>
        {Object.entries(config).map(([setting, showSetting]) => {
          const typedSetting = setting as keyof StatsSettings;
          const value = settings[typedSetting];
          const label = settingToLabel[typedSetting];

          return showSetting ? (
            <FormControlLabel
              key={setting}
              label={label}
              control={<Switch checked={value} onChange={(event) => onChangeSetting(typedSetting, event.target.checked)} />}
            />
          ) : null;
        })}
      </FormGroup>
    </div>
  );
};

const Metric = ({ label, value, from }: { label: string; value: number | string; from?: number }) => {
  const { classes } = useStyles();

  return (
    <div className={classes.metric}>
      <Typography component="span">{label}</Typography>

      <span>
        <Typography fontWeight="bold" component="span">
          {value}
        </Typography>

        {from !== undefined && isNumber(value) && (
          <Typography
            sx={{ marginLeft: 0.5 }}
            component="span"
            color="action.active"
          >{`(${from ? Math.floor((value / from) * 100) : 0}%)`}</Typography>
        )}
      </span>
    </div>
  );
};

function isClickInArea(click: { x: number; y: number }, area: SelectionAreaType) {
  return click.x >= area.left && click.x <= area.left + area.width && click.y >= area.top && click.y <= area.top + area.height;
}
