import { forwardRef, useEffect, useMemo, useState } from 'react';

import { isObject } from 'lodash';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import FlagIcon from '@mui/icons-material/Flag';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import { Dialog, Paper, Slide, Tooltip, alpha } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';

import {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  MiniMap,
  NodeProps,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { PrototypeQuestion as PrototypeQuestionType, PrototypeScreen as PrototypeScreenType } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { InlineRichEditor } from '../../inline-rich-editor';
import { RichText } from '../../stats-page/rich-text';
import { useFieldController } from '../../store';

import { GoToEdge } from './go-to-edge';
import { PrototypeScreen } from './prototype-screen';
import { PrototypeScreenContextProvider, usePrototypeScreenContext } from './prototype-screen-context';
import { usePasteScreen } from './use-paste-screen';

const useStyles = makeStyles()((theme) => ({
  root: {
    width: '100vw',
    height: '100vh',
    position: 'relative',
    '& .react-flow__node': {
      zIndex: '-1 !important',
    },
  },
  toolbar: {
    position: 'absolute',
    bottom: theme.spacing(4),
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.common.white,
    padding: theme.spacing(1),
    gap: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius * 4,
  },
  toolbarButton: {
    all: 'unset',
    width: 32,
    height: 32,
    boxSizing: 'border-box',
    borderRadius: theme.shape.borderRadius,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: theme.spacing(1),
    '&:hover': {
      backgroundColor: theme.palette.grey[100],
    },
  },
  selected: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.light, 0.8),
    },
  },
  indeterminateSelect: {
    outline: `2px solid ${theme.palette.primary.light}`,
  },
  screenPreviewList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1.5),
  },
  screenPreviewDescription: {
    color: theme.palette.action.active,
    wordWrap: 'break-word',
  },
  screenPreview: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    cursor: 'pointer',
    position: 'relative',
    width: 96,
  },
  screenPreviewImage: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid #d5d6da',
    borderRadius: theme.shape.borderRadius * 2,
    width: 96,
    height: 96,
    objectFit: 'contain',
    backgroundColor: theme.palette.grey[100],
    '&:hover': {
      outline: `2px solid ${theme.palette.primary.light}`,
    },
  },
  startIcon: {
    color: theme.palette.warning.light,
  },
  targetIcon: {
    color: theme.palette.success.light,
  },
  screenPreviewMarker: {
    position: 'absolute',
    right: theme.spacing(0.5),
    top: theme.spacing(0.5),
  },
  description: {
    margin: theme.spacing(2, 0),
    '& .tiptap': {
      padding: 0,
    },
  },
}));

type NodeType = 'prototypeScreen';
const nodeTypes: Record<NodeType, React.ComponentType<NodeProps & Omit<PrototypeScreenType, 'position'>>> = {
  prototypeScreen: PrototypeScreen,
};

const edgeTypes = {
  goToEdge: GoToEdge,
};

const PrototypeScreenSetup = ({
  screens,
  initialScreenId,
  onClose,
}: {
  screens: PrototypeScreenType[];
  initialScreenId: string | null;
  onClose: VoidFunction;
}) => {
  const { classes } = useStyles();
  const { edgeDisplayMode, addScreen, handlers } = usePrototypeScreenContext();
  const { fitView } = useReactFlow();

  const nodes: PrototypeScreenType[] = useMemo(
    () => screens.map((screen) => ({ ...screen, type: 'prototypeScreen', dragHandle: '.drag-handle' })),
    [screens],
  );

  const edges: Edge[] = useMemo(() => {
    if (edgeDisplayMode === 'hidden') {
      return [];
    }

    return screens.flatMap((screen) => {
      return screen.data.areas.reduce<Edge[]>((result, area) => {
        if (
          area.goToScreenId &&
          (!isObject(edgeDisplayMode) ||
            (edgeDisplayMode.mode === 'in' && area.goToScreenId === edgeDisplayMode.screenId) ||
            (edgeDisplayMode.mode === 'out' && screen.id === edgeDisplayMode.screenId) ||
            (edgeDisplayMode.mode === 'all' &&
              (area.goToScreenId === edgeDisplayMode.screenId || screen.id === edgeDisplayMode.screenId)))
        ) {
          const source = screen.id;
          const target = area.goToScreenId;
          result.push({
            id: `${source}.${area.id}.${target}`,
            source,
            sourceHandle: area.id,
            target,
            targetHandle: area.goToSide,
            type: 'goToEdge',
          } satisfies Edge);
        }

        return result;
      }, []);
    });
  }, [screens, edgeDisplayMode]);

  usePasteScreen(addScreen);

  useEffect(() => {
    const preferredNode = nodes.find((node) => (initialScreenId ? node.id === initialScreenId : node.data.startScreen));
    const [firstNode] = nodes;
    const nodeToFocus = preferredNode ?? firstNode;

    if (nodeToFocus) {
      requestAnimationFrame(() => {
        fitView({ nodes: [nodeToFocus] });
      });
    }
  }, [initialScreenId]);

  return (
    <div className={classes.root}>
      <ReactFlow<PrototypeScreenType>
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodes={nodes}
        edges={edges}
        minZoom={0.1}
        maxZoom={2}
        {...handlers}
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>

      <Toolbar onAdd={() => addScreen()} onClose={onClose} />
    </div>
  );
};

const Toolbar = ({ onAdd, onClose }: { onAdd: VoidFunction; onClose: VoidFunction }) => {
  const { classes, cx } = useStyles();
  const { edgeDisplayMode, setEdgeDisplayMode } = usePrototypeScreenContext();

  return (
    <Paper className={classes.toolbar} elevation={2}>
      <Tooltip title="Добавить экран">
        <button className={classes.toolbarButton} onClick={onAdd}>
          <AddIcon />
        </button>
      </Tooltip>

      <Tooltip title={edgeDisplayMode === 'visible' ? 'Скрыть переходы' : 'Показать все переходы'}>
        <button
          className={cx(classes.toolbarButton, {
            [classes.selected]: edgeDisplayMode === 'visible',
            [classes.indeterminateSelect]: isObject(edgeDisplayMode),
          })}
          onClick={() => setEdgeDisplayMode((prev) => (prev === 'visible' ? 'hidden' : 'visible'))}
        >
          <CompareArrowsIcon />
        </button>
      </Tooltip>

      <Tooltip title="Завершить настройку">
        <button className={classes.toolbarButton} onClick={onClose}>
          <CloseIcon />
        </button>
      </Tooltip>
    </Paper>
  );
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const PrototypeQuestion = ({ question, index }: { question: PrototypeQuestionType; index: number }) => {
  const { classes } = useStyles();
  const [initialScreenId, setInitialScreenId] = useState<string | null>(null);

  const handleClose = () => setInitialScreenId(null);

  return (
    <>
      <PrototypeDescription path={`research.questions.${index}.description`} />

      <div className={classes.screenPreviewList}>
        {question.screens.map((screen) => (
          <ScreenPreviewCard key={screen.id} screen={screen} onClick={setInitialScreenId} />
        ))}
      </div>

      <Dialog key={index} open={!!initialScreenId} onClose={handleClose} TransitionComponent={Transition} fullScreen>
        <ReactFlowProvider>
          <PrototypeScreenContextProvider index={index}>
            <PrototypeScreenSetup screens={question.screens} initialScreenId={initialScreenId} onClose={handleClose} />
          </PrototypeScreenContextProvider>
        </ReactFlowProvider>
      </Dialog>
    </>
  );
};

const ScreenPreviewCard = ({ screen, onClick }: { screen: PrototypeScreenType; onClick: (screenId: string) => void }) => {
  const { classes } = useStyles();

  const marker = screen.data.startScreen ? (
    <PlayCircleFilledIcon className={classes.startIcon} />
  ) : screen.data.targetScreen ? (
    <FlagIcon className={classes.targetIcon} />
  ) : null;

  return (
    <div className={classes.screenPreview} role="button" onClick={() => onClick(screen.id)}>
      {marker && <div className={classes.screenPreviewMarker}>{marker}</div>}

      {screen.data.imageSrc ? (
        <img className={classes.screenPreviewImage} src={screen.data.imageSrc} />
      ) : (
        <div className={classes.screenPreviewImage}>
          <ImageNotSupportedIcon color="action" sx={{ width: 48, height: 48 }} />
        </div>
      )}

      <span className={classes.screenPreviewDescription}>
        <RichText text={screen.data.description} />
      </span>
    </div>
  );
};

export const PrototypeDescription = ({ path }: { path: `research.questions.${number}.description` }) => {
  const { classes } = useStyles();
  const { value, onChange, ref } = useFieldController(path);

  return (
    <InlineRichEditor
      className={classes.description}
      value={value ?? ''}
      onChange={onChange}
      placeholder="Введите текст описания"
      ref={ref}
    />
  );
};
