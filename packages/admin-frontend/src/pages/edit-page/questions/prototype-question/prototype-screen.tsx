import { memo, useEffect, useRef, useState } from 'react';

import { isEqual, isObject } from 'lodash';

import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import ClearIcon from '@mui/icons-material/Clear';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import FlagIcon from '@mui/icons-material/Flag';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import { IconButton, Paper, Tooltip, alpha } from '@mui/material';

import { Handle, NodeProps, Position } from '@xyflow/react';
import { PrototypeScreen as PrototypeScreenType } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { getRelativeRectStyle } from '../../common';
import { useEditPageActions } from '../../store';

import { ImageUploader } from './image-uploader';
import { EdgeDisplayMode, usePrototypeScreenContext, useScreenController } from './prototype-screen-context';
import { ScreenArea } from './screen-area';
import { ScreenDescription } from './screen-description';
import { useDrawArea } from './use-draw-area';

const useStyles = makeStyles<void, 'actionsContainer' | 'hidden' | 'clearImageButton'>()((theme, _, classes) => ({
  root: {
    maxWidth: 400,
    cursor: 'default',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    [`&:hover .${classes.actionsContainer}, &:focus-within .${classes.actionsContainer}`]: {
      visibility: 'visible',
    },
    [` &:hover .${classes.clearImageButton}, &:focus-within .${classes.clearImageButton}`]: {
      visibility: 'visible',
    },
    [`&:hover .${classes.hidden}, &:focus-within .${classes.hidden}`]: {
      display: 'inherit',
    },
  },
  paper: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius * 2,
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: theme.palette.common.white,
    borderRadius: `0 0 ${theme.shape.borderRadius * 2}px ${theme.shape.borderRadius * 2}px`,
    overflow: 'hidden',
  },
  workarea: {
    position: 'relative',
  },
  image: {
    width: 'auto',
    height: 'auto',
    maxWidth: '100%',
    maxHeight: 500,
    userSelect: 'none',
    cursor: 'crosshair',
    verticalAlign: 'top',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: theme.spacing(1),
    padding: theme.spacing(0.5),
    justifyContent: 'space-between',
  },
  actionsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    visibility: 'hidden',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(0.75),
  },
  startActions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    marginRight: 'auto',
  },
  headerButton: {
    all: 'unset',
    width: 24,
    height: 24,
    boxSizing: 'border-box',
    borderRadius: theme.shape.borderRadius,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: theme.spacing(1),
    color: theme.palette.action.active,
    '&:not(:disabled):hover': {
      backgroundColor: theme.palette.grey[100],
    },
    '&:disabled': {
      opacity: 0.5,
    },
  },
  selected: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.light, 0.8),
    },
  },
  visible: {
    visibility: 'visible',
  },
  hidden: {
    display: 'none',
  },
  description: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    maxWidth: 300,
  },
  areaGhost: {
    backgroundColor: theme.palette.primary.dark,
    opacity: 0.5,
    pointerEvents: 'none',
    boxSizing: 'border-box',
    userSelect: 'none',
  },
  startActiveIcon: {
    color: theme.palette.warning.light,
  },
  targetActiveIcon: {
    color: theme.palette.success.light,
  },
  clearImageButton: {
    width: 24,
    height: 24,
    padding: 0,
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    zIndex: theme.zIndex.modal,
    visibility: 'hidden',
  },
}));
export const PrototypeScreen = memo(({ id, data }: NodeProps & Omit<PrototypeScreenType, 'position'>) => {
  const { classes, cx } = useStyles();

  const {
    form: { setFieldValue, getFieldValue },
  } = useEditPageActions();
  const { path, edgeDisplayMode, setEdgeDisplayMode, toggleScreenStartMark, toggleScreenTargetMark, canDeleteScreen } =
    usePrototypeScreenContext();
  const { value: imageSrc, onChange: onImageSrcChange } = useScreenController(id, 'data.imageSrc');
  const { value: areas = [], onChange: setAreas } = useScreenController(id, 'data.areas');
  const { areaGhost, imageRef } = useDrawArea(id);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const currentSelectedArea = useRef(selectedArea);
  currentSelectedArea.current = selectedArea;

  const handleRemoveArea = (id: string) => {
    setAreas((prevAreas) => prevAreas.filter((area) => area.id !== id));
  };

  const handleRemoveScreen = () => {
    setFieldValue(
      path,
      getFieldValue(path).filter((screen) => screen.id !== id),
    );
  };

  useEffect(() => {
    const resetSelectedArea = () => {
      setSelectedArea(null);
    };
    const removeSelectedArea = (event: KeyboardEvent) => {
      const selectedArea = currentSelectedArea.current;

      if (selectedArea && (event.key === 'Delete' || event.key === 'Backspace')) {
        event.stopImmediatePropagation();
        handleRemoveArea(selectedArea);
      }
    };

    window.addEventListener('mousedown', resetSelectedArea);
    window.addEventListener('keydown', removeSelectedArea);
    return () => {
      window.removeEventListener('mousedown', resetSelectedArea);
      window.removeEventListener('keydown', removeSelectedArea);
    };
  }, []);

  const showScreenEdges = isObject(edgeDisplayMode) && edgeDisplayMode.screenId === id;
  const showAllScreenEdges = showScreenEdges && edgeDisplayMode.mode === 'all';
  const showInScreenEdges = showScreenEdges && edgeDisplayMode.mode === 'in';
  const showOutScreenEdges = showScreenEdges && edgeDisplayMode.mode === 'out';

  const getEdgeDisplayModeHandler = (mode: EdgeDisplayMode) => () => {
    setEdgeDisplayMode((prev) => {
      if (isEqual(prev, mode)) return 'visible';
      return mode;
    });
  };

  return (
    <div className={classes.root}>
      <div className={cx(classes.actionsContainer, { [classes.visible]: showScreenEdges })}>
        <div className={classes.startActions}>
          <ScreenActionButton
            className={cx({ [classes.visible]: data.startScreen, [classes.hidden]: data.targetScreen })}
            tooltip="Сделать начальным экраном"
            onClick={() => toggleScreenStartMark(id)}
          >
            <PlayCircleFilledIcon className={cx({ [classes.startActiveIcon]: data.startScreen })} />
          </ScreenActionButton>

          <ScreenActionButton
            className={cx({ [classes.visible]: data.targetScreen })}
            tooltip="Сделать целевым экраном"
            onClick={() => toggleScreenTargetMark(id)}
          >
            <FlagIcon className={cx({ [classes.targetActiveIcon]: data.targetScreen })} />
          </ScreenActionButton>
        </div>

        <ScreenActionButton
          tooltip="Переходы к экрану"
          selected={showInScreenEdges}
          onClick={getEdgeDisplayModeHandler({ screenId: id, mode: 'in' })}
        >
          <ArrowRightAltIcon sx={{ transform: 'rotate(180deg)' }} />
        </ScreenActionButton>

        <ScreenActionButton
          tooltip="Переходы от экрана"
          selected={showOutScreenEdges}
          onClick={getEdgeDisplayModeHandler({ screenId: id, mode: 'out' })}
        >
          <ArrowRightAltIcon />
        </ScreenActionButton>

        <ScreenActionButton
          tooltip="Переходы от экрана и к экрану"
          selected={showAllScreenEdges}
          onClick={getEdgeDisplayModeHandler({ screenId: id, mode: 'all' })}
        >
          <CompareArrowsIcon />
        </ScreenActionButton>

        <ScreenActionButton className="drag-handle">
          <DragIndicatorIcon style={{ cursor: 'grab' }} />
        </ScreenActionButton>

        <ScreenActionButton tooltip="Удалить экран" onClick={handleRemoveScreen} disabled={!canDeleteScreen}>
          <DeleteIcon />
        </ScreenActionButton>
      </div>

      <Paper className={cx('nokey', classes.paper)} elevation={4}>
        <header className={classes.header}>
          <div className={classes.description}>
            <ScreenDescription screenId={id} />
          </div>
        </header>

        <div className={classes.imageContainer}>
          <div className={classes.workarea}>
            {imageSrc ? (
              <>
                <img className={classes.image} src={imageSrc} draggable={false} ref={imageRef} />

                <IconButton className={classes.clearImageButton} size="small" onClick={() => onImageSrcChange('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </>
            ) : (
              <ImageUploader onImageUpload={onImageSrcChange} />
            )}

            {areaGhost && <div className={classes.areaGhost} style={getRelativeRectStyle(areaGhost)} />}

            {!!imageSrc &&
              areas.map((area, index) => (
                <ScreenArea
                  selected={area.id === selectedArea}
                  key={area.id}
                  id={area.id}
                  screenId={id}
                  path={`data.areas.${index}`}
                  imageRef={imageRef}
                  onSelect={setSelectedArea}
                />
              ))}
          </div>

          <Handle type="target" id="left" position={Position.Left} />
          <Handle type="target" id="right" position={Position.Right} />
        </div>
      </Paper>
    </div>
  );
});

PrototypeScreen.displayName = 'PrototypeScreen';

const ScreenActionButton = ({
  children,
  tooltip,
  selected,
  disabled,
  className,
  onClick,
}: {
  children: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  tooltip?: string;
  className?: string;
  onClick?: VoidFunction;
}) => {
  const { classes, cx } = useStyles();

  return (
    <Tooltip title={tooltip}>
      <button
        className={cx(classes.headerButton, className, { [classes.selected]: selected })}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>
    </Tooltip>
  );
};
