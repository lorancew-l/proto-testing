import React, { RefObject, useEffect, useRef } from 'react';

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
  className,
  imageRef,
  children,
  disableGoTo,
}: {
  screen: PrototypeScreen;
  screens: PrototypeScreen[];
  clicks: PrototypeQuestionClickStats;
  showAreas?: boolean;
  onGoToScreen?: (screenId: string) => void;
  className?: string;
  imageRef?: React.Ref<HTMLImageElement>;
  children?: React.ReactNode;
  disableGoTo?: boolean;
}) => {
  const { classes, cx } = useStyles();

  const containerRef = useRef<HTMLDivElement | null>(null);

  useHeatmap({ clicks, containerRef });

  return (
    <PrototypeScreenImage
      imageRef={imageRef}
      className={cx(classes.heatmap, className)}
      screen={screen}
      screens={screens}
      onGoToScreen={onGoToScreen}
      showAreas={showAreas}
      containerRef={containerRef}
      disableGoTo={disableGoTo}
    >
      {children}
    </PrototypeScreenImage>
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
