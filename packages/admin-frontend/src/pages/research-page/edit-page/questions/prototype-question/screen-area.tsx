import { RefObject } from 'react';

import { alpha } from '@mui/material';

import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react';
import { makeStyles } from 'tss-react/mui';

import { useSubscribeScreenChanges } from './prototype-screen-context';
import { ResizableArea } from './resizeable-area';
import { useAreaDrag } from './use-area-drag';

const useStyles = makeStyles()((theme) => ({
  area: {
    zIndex: 20,
    backgroundColor: alpha(theme.palette.primary.light, 0.3),
    border: `1px solid ${theme.palette.primary.dark}`,
    width: '100%',
    height: '100%',
    position: 'relative',
    cursor: 'grab',
    '& .react-flow__handle': {
      width: '10px',
      height: '10px',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%,-50%)',
      backgroundColor: theme.palette.primary.main,
      border: '1px solid #d5d6da',
    },
  },
}));

export const ScreenArea = ({
  id,
  screenId,
  path,
  imageRef,
  selected,
  onSelect,
}: {
  id: string;
  screenId: string;
  selected: boolean;
  path: `data.areas.${number}`;
  imageRef: RefObject<HTMLElement | null>;
  onSelect: (id: string) => void;
}) => {
  const { classes } = useStyles();
  const handlers = useAreaDrag({ screenId, path: `${path}.rect`, imageRef });
  const updateNodeInternals = useUpdateNodeInternals();

  useSubscribeScreenChanges(screenId, `${path}.rect`, () => {
    updateNodeInternals(screenId);
  });

  return (
    <ResizableArea selected={selected} screenId={screenId} path={`${path}.rect`} imageRef={imageRef}>
      <div
        className={classes.area}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(id);
        }}
        {...handlers}
      >
        <div onMouseDown={(e) => e.stopPropagation()}>
          <Handle style={{ zIndex: 1000 }} type="source" position={Position.Right} id={id} />
        </div>
      </div>
    </ResizableArea>
  );
};
