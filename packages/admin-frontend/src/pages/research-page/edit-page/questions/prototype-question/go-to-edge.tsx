import React from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { IconButton, lighten } from '@mui/material';

import { EdgeProps, getBezierPath } from '@xyflow/react';
import { makeStyles } from 'tss-react/mui';

import { usePrototypeScreenContext } from './prototype-screen-context';

const foreignObjectSize = 20;

const useStyles = makeStyles<void, 'edge' | 'arrowMarker'>()((theme, _, classes) => ({
  button: {
    border: `1px solid #d5d6da`,
    width: foreignObjectSize,
    height: foreignObjectSize,
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
      backgroundColor: lighten(theme.palette.background.paper, 0.1),
    },
    '& svg': {
      width: 12,
      height: 12,
    },
  },
  selector: {
    fill: 'none',
    stroke: 'transparent',
    strokeWidth: 20,
    markerEnd: "url('#arrowMarker')",
    color: 'red',
    [`&:hover + .${classes.edge}.${classes.edge}.${classes.edge}.${classes.edge}.${classes.edge}`]: {
      stroke: theme.palette.primary.main,
    },
    [`&:hover`]: {
      markerEnd: "url('#arrowMarkerHover')",
    },
  },
  edge: {
    '&&&&&': {
      stroke: theme.palette.primary.light,
      strokeWidth: 2,
      pointerEvents: 'none',
    },
  },
  arrowMarker: {
    stroke: theme.palette.primary.light,
    fill: theme.palette.primary.light,
  },
  arrowMarkerHover: {
    stroke: theme.palette.primary.main,
    fill: theme.palette.primary.main,
  },
}));

export const GoToEdge: React.FC<EdgeProps> = ({
  id,
  source,
  sourceHandleId,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}) => {
  const { classes, cx } = useStyles();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { deleteEdge } = usePrototypeScreenContext();

  const handleRemoveEdge = () => {
    deleteEdge({ source, sourceHandle: sourceHandleId });
  };

  return (
    <>
      <path d={edgePath} className={cx('react-flow__edge-path-selector', classes.selector)} fillRule="evenodd" />
      <path id={id} d={edgePath} className={cx('react-flow__edge-path', classes.edge)} fillRule="evenodd" />

      <defs>
        {(['arrowMarker', 'arrowMarkerHover'] as const).map((id) => (
          <marker
            key={id}
            id={id}
            className={classes[id]}
            markerWidth="2"
            markerHeight="2"
            viewBox="-10 -10 20 20"
            markerUnits="strokeWidth"
            orient="auto-start-reverse"
            refX="0"
            refY="0"
          >
            <polyline strokeLinecap="round" strokeLinejoin="round" points="-5,-4 0,0 -5,4 -5,-4" strokeWidth={1}></polyline>
          </marker>
        ))}
      </defs>

      <foreignObject
        width={foreignObjectSize}
        height={foreignObjectSize}
        x={labelX - foreignObjectSize / 2}
        y={labelY - foreignObjectSize / 2}
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <IconButton size="small" className={classes.button} onClick={handleRemoveEdge}>
          <CloseIcon />
        </IconButton>
      </foreignObject>
    </>
  );
};
