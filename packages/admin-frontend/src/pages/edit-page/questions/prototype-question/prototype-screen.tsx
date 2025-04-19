import { memo, useEffect, useRef, useState } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Paper } from '@mui/material';

import { Handle, NodeProps, Position } from '@xyflow/react';
import { PrototypeScreen as PrototypeScreenType } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { useEditPageActions } from '../../store';

import { getRelativeRectStyle } from './get-rect-style';
import { ImageUploader } from './image-uploader';
import { usePrototypeScreenSettingsContext, useScreenController, useScreenIndex } from './prototype-screen-settings-context';
import { ScreenArea } from './screen-area';
import { ScreenDescription } from './screen-description';
import { useDrawArea } from './use-draw-area';

const useStyles = makeStyles<void, 'actionsContainer'>()((theme, _, classes) => ({
  root: {
    cursor: 'default',
    position: 'relative',
    // padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: '#d5d6da',
    [`&:hover .${classes.actionsContainer}`]: {
      visibility: 'visible',
    },
    [`&:focus-within .${classes.actionsContainer}`]: {
      visibility: 'visible',
    },
    maxWidth: 400,
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
    padding: theme.spacing(0.5),
    justifyContent: 'space-between',
  },
  actionsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    visibility: 'hidden',
    marginLeft: theme.spacing(1),
    height: 25,
  },
  headerButton: {
    all: 'unset',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    '&:hover > *': {
      opacity: 0.7,
    },
  },
  description: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  areaGhost: {
    backgroundColor: theme.palette.primary.dark,
    opacity: 0.5,
    pointerEvents: 'none',
    boxSizing: 'border-box',
    userSelect: 'none',
  },
}));

export const PrototypeScreen = memo(({ id }: NodeProps & Omit<PrototypeScreenType, 'position'>) => {
  const { classes, cx } = useStyles();

  const {
    form: { setFieldValue, getFieldValue },
  } = useEditPageActions();
  const { path } = usePrototypeScreenSettingsContext();
  const { value: imageSrc, onChange: onImageSrcChange } = useScreenController(id, 'data.imageSrc');
  const { value: areas = [], onChange: setAreas } = useScreenController(id, 'data.areas');
  const index = useScreenIndex(id);
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

  return (
    <Paper className={cx('nokey', classes.root)}>
      <div className={classes.header}>
        <div className={classes.description}>
          <ScreenDescription screenId={id} />
        </div>

        <div className={classes.actionsContainer}>
          <button style={{ cursor: 'grab' }} className={cx(classes.headerButton, 'drag-handle')}>
            <DragIndicatorIcon color="action" />
          </button>

          <button className={classes.headerButton} onClick={handleRemoveScreen}>
            <DeleteIcon color="action" />
          </button>
        </div>
      </div>

      <div className={classes.imageContainer}>
        <div className={classes.workarea}>
          {!imageSrc ? (
            <ImageUploader onImageUpload={onImageSrcChange} />
          ) : (
            <img className={classes.image} src={imageSrc} draggable={false} ref={imageRef} />
          )}

          {areaGhost && <div className={classes.areaGhost} style={getRelativeRectStyle(areaGhost)} />}

          {areas.map((area, index) => (
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

        {index !== 0 && <Handle type="target" position={Position.Left} />}
      </div>
    </Paper>
  );
});

PrototypeScreen.displayName = 'PrototypeScreen';
