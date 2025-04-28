import { Ref, useMemo } from 'react';

import { Tooltip, Typography } from '@mui/material';

import type { PrototypeScreen } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { RichText } from '../rich-text';

const useStyles = makeStyles()((theme) => ({
  screen: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.palette.grey[200],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    display: 'inline-block',
    position: 'relative',
    height: '100%',
  },
  image: {
    display: 'block',
    height: 'auto',
    maxWidth: '100%',
    maxHeight: '100%',
    userSelect: 'none',
  },
  clickableArea: {
    position: 'absolute',
    backgroundColor: theme.palette.primary.light,
    opacity: 0.5,
    zIndex: 10,
  },
  tooltipContent: {
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
}));

export const PrototypeScreenImage = ({
  screen,
  screens,
  children,
  showAreas,
  onGoToScreen,
  className,
  containerRef,
  imageRef,
  disableGoTo,
}: {
  screen: PrototypeScreen;
  screens: PrototypeScreen[];
  children?: React.ReactNode;
  showAreas?: boolean;
  onGoToScreen?: (screenId: string) => void;
  className?: string;
  containerRef?: Ref<HTMLDivElement | null>;
  imageRef?: Ref<HTMLImageElement>;
  disableGoTo?: boolean;
}) => {
  const { classes, cx } = useStyles();

  const screenMap = useMemo(() => {
    return new Map<string, { description: string; index: number }>(
      screens.map((screen, index) => [screen.id, { description: screen.data.description, index }]),
    );
  }, [screens]);

  return (
    <div className={cx(classes.screen, className)}>
      <div className={classes.imageContainer} ref={containerRef}>
        <img className={classes.image} src={screen.data.imageSrc} draggable={false} ref={imageRef} />

        {screen.data.areas.map((area) => {
          const goToScreenId = area.goToScreenId;
          if (!goToScreenId) return null;

          const screenInfo = screenMap.get(goToScreenId);

          return (
            <Tooltip
              key={area.id}
              enterDelay={400}
              title={
                screenInfo && showAreas ? (
                  <div className={classes.tooltipContent}>
                    <Typography component="span" fontSize={12}>{`Экран ${screenInfo.index + 1}:`}</Typography>
                    <RichText text={screenInfo.description} />
                  </div>
                ) : (
                  ''
                )
              }
            >
              <div
                role="button"
                className={classes.clickableArea}
                style={{
                  left: `${area.rect.left}%`,
                  top: `${area.rect.top}%`,
                  width: `${area.rect.width}%`,
                  height: `${area.rect.height}%`,
                  opacity: showAreas ? 0.5 : 0,
                  ...(disableGoTo && { pointerEvents: 'none' }),
                }}
                onClick={() => {
                  onGoToScreen?.(goToScreenId);
                }}
              />
            </Tooltip>
          );
        })}

        {children}
      </div>
    </div>
  );
};
