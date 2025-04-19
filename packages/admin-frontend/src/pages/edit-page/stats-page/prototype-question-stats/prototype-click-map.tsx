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
  showClickOrder,
  onGoToScreen,
}: {
  screen: PrototypeScreen & { ssid?: string };
  screens: PrototypeScreen[];
  clicks: PrototypeQuestionClickStats;
  showAreas?: boolean;
  showClickOrder?: boolean;
  onGoToScreen: (state: { screenId: string; ssid?: string }) => void;
}) => {
  const { classes, cx } = useStyles();

  return (
    <PrototypeScreenImage screen={screen} screens={screens} onGoToScreen={onGoToScreen} showAreas={showAreas}>
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
    </PrototypeScreenImage>
  );
};
