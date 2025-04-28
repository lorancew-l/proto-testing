import React from 'react';

import type { PrototypeScreen } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { PrototypeQuestionClickStats } from '../types';

import { PrototypeScreenImage } from './prototype-screen-image';

const useStyles = makeStyles()((theme) => ({
  click: {
    position: 'absolute',
    zIndex: 20,
    width: 24,
    height: 24,
    borderRadius: '50%',
    border: '2px solid #d5d6da',
    transform: 'translate(-50%, -50%)',
    backgroundColor: theme.palette.error.light,
  },
  targetClick: {
    backgroundColor: theme.palette.success.light,
  },
  orderedClick: {
    '&::before': {
      position: 'absolute',
      content: 'attr(data-order)',
      color: theme.palette.common.white,
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: 14,
    },
  },
}));

export const PrototypeClickMap = ({
  screen,
  screens,
  clicks,
  showAreas,
  className,
  showClickOrder,
  onGoToScreen,
  imageRef,
  children,
  disableGoTo,
}: {
  screen: PrototypeScreen;
  screens: PrototypeScreen[];
  clicks: PrototypeQuestionClickStats;
  className?: string;
  showAreas?: boolean;
  showClickOrder?: boolean;
  onGoToScreen?: (screenId: string) => void;
  imageRef?: React.Ref<HTMLImageElement>;
  children?: React.ReactNode;
  disableGoTo?: boolean;
}) => {
  const { classes, cx } = useStyles();

  return (
    <PrototypeScreenImage
      imageRef={imageRef}
      className={className}
      screen={screen}
      screens={screens}
      onGoToScreen={onGoToScreen}
      showAreas={showAreas}
      disableGoTo={disableGoTo}
    >
      {clicks.map((click, index) => (
        <div
          key={click.ts}
          data-order={index + 1}
          style={{
            left: `${click.x}%`,
            top: `${click.y}%`,
          }}
          className={cx(classes.click, { [classes.targetClick]: !!click.areaId, [classes.orderedClick]: showClickOrder })}
        />
      ))}
      {children}
    </PrototypeScreenImage>
  );
};
