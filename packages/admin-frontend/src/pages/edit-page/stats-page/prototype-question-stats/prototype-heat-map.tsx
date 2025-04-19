import { RefObject, useEffect, useRef } from 'react';

import h337 from 'heatmap.js';
import type { PrototypeScreen } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { PrototypeQuestionClickStats } from '../types';

import { PrototypeScreenImage } from './prototype-screen-image';

const useStyles = makeStyles()(() => ({
  heatmap: {
    '& canvas': {
      zIndex: 10,
      pointerEvents: 'none',
    },
  },
}));

export const PrototypeHeatMap = ({
  screen,
  screens,
  clicks,
  showAreas,
  onGoToScreen,
}: {
  screen: PrototypeScreen & { ssid?: string };
  screens: PrototypeScreen[];
  clicks: PrototypeQuestionClickStats;
  showAreas?: boolean;
  onGoToScreen: (state: { screenId: string; ssid?: string }) => void;
}) => {
  const { classes } = useStyles();

  const containerRef = useRef<HTMLDivElement | null>(null);

  useHeatmap({ clicks, containerRef });

  return (
    <PrototypeScreenImage
      className={classes.heatmap}
      screen={screen}
      screens={screens}
      onGoToScreen={onGoToScreen}
      showAreas={showAreas}
      containerRef={containerRef}
    />
  );
};

export const useHeatmap = ({
  clicks,
  containerRef,
}: {
  clicks: { x: number; y: number }[];
  containerRef: RefObject<HTMLDivElement | null>;
}) => {
  const heatmapInstanceRef = useRef<h337.Heatmap<'value', 'x', 'y'> | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!heatmapInstanceRef.current) {
      heatmapInstanceRef.current = h337.create({
        xField: 'x',
        yField: 'y',
        valueField: 'value',
        container,
        radius: 24,
        maxOpacity: 0.6,
        minOpacity: 0,
        blur: 0.85,
      });
    }

    const heatmap = heatmapInstanceRef.current;

    const rect = container.getBoundingClientRect();

    const dataPoints = clicks.map((click) => ({
      x: Math.round((click.x / 100) * rect.width),
      y: Math.round((click.y / 100) * rect.height),
      value: 1,
    }));

    heatmap.setData({ min: 1, max: 1, data: dataPoints });
  }, [clicks]);
};
