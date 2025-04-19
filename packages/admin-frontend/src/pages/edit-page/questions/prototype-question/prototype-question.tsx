import { forwardRef, useCallback, useMemo, useState } from 'react';

import { cloneDeep } from 'lodash';

import AddIcon from '@mui/icons-material/Add';
import { Button, Dialog, Paper, Slide, Typography } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';

import {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  MiniMap,
  NodeProps,
  OnEdgesChange,
  OnNodesChange,
  ReactFlow,
  ReactFlowProvider,
  applyNodeChanges,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nanoid } from 'nanoid';
import type { PrototypeQuestion as PrototypeQuestionType, PrototypeScreen as PrototypeScreenType } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { useEditPageActions } from '../../store';

import { PrototypeScreen } from './prototype-screen';
import { PrototypeScreenSettingsContextProvider, usePrototypeScreenSettingsContext } from './prototype-screen-settings-context';

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
    padding: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius * 4,
  },
  toolbarButton: {
    all: 'unset',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: theme.spacing(1),
    '&:hover > *': {
      opacity: 0.7,
    },
    '&:not(:last-child):after': {
      content: '""',
      position: 'absolute',
      transform: 'translateX(-50%)',
      width: 1,
      height: '60%',
      right: 0,
      backgroundColor: theme.palette.action.active,
    },
  },
}));

type NodeType = 'prototypeScreen';
const nodeTypes: Record<NodeType, React.ComponentType<NodeProps & Omit<PrototypeScreenType, 'position'>>> = {
  prototypeScreen: PrototypeScreen,
};

const PrototypeScreenSetup = ({ screens, onClose }: { screens: PrototypeScreenType[]; onClose: VoidFunction }) => {
  const { classes } = useStyles();

  const {
    form: { getFieldValue, setFieldValue },
  } = useEditPageActions();
  const { path } = usePrototypeScreenSettingsContext();
  const { screenToFlowPosition } = useReactFlow();

  const nodes: PrototypeScreenType[] = useMemo(
    () => screens.map((screen) => ({ ...screen, type: 'prototypeScreen', dragHandle: '.drag-handle' })),
    [screens],
  );

  const edges: Edge[] = useMemo(
    () =>
      screens.flatMap((screen) =>
        screen.data.areas.reduce<Edge[]>((result, area) => {
          if (area.goToScreenId) {
            const source = screen.id;
            const target = area.goToScreenId;
            result.push({ id: `${source}.${area.id}.${target}`, source, target } satisfies Edge);
          }

          return result;
        }, []),
      ),
    [screens],
  );

  const handleAddScreen = () => {
    setFieldValue(path, [
      ...getFieldValue(path),
      {
        id: nanoid(10),
        position: screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }),
        data: { imageSrc: '', description: '', areas: [] },
      },
    ]);
  };

  const handleNodesChange: OnNodesChange<PrototypeScreenType> = (changes) => {
    // https://github.com/xyflow/xyflow/issues/4253
    setFieldValue(path, applyNodeChanges(changes, cloneDeep(getFieldValue(path))));
  };

  const handleEdgesChange: OnEdgesChange = () => {};

  const onConnect = useCallback((params: Connection) => {
    const [screenId, areaId] = params.sourceHandle?.split('.') ?? [];

    if (!(screenId && areaId)) return;

    const screens = getFieldValue(path);
    const screenIndex = screens.findIndex((screen) => screen.id === screenId);
    const screen = screens[screenIndex];

    if (!screen) return;

    const areaIndex = screen.data.areas.findIndex((area) => area.id === areaId);
    if (areaIndex === -1) return;

    const goToScreenIdPath = `${path}.${screenIndex}.data.areas.${areaIndex}.goToScreenId` as const;
    setFieldValue(goToScreenIdPath, params.target);
  }, []);

  return (
    <div className={classes.root}>
      <ReactFlow<PrototypeScreenType>
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>

      <Toolbar onAdd={handleAddScreen} onClose={onClose} />
    </div>
  );
};

const Toolbar = ({ onAdd, onClose }: { onAdd: VoidFunction; onClose: VoidFunction }) => {
  const { classes } = useStyles();

  return (
    <Paper className={classes.toolbar} elevation={2}>
      <button className={classes.toolbarButton} onClick={onAdd}>
        <AddIcon />
      </button>

      <button className={classes.toolbarButton} onClick={onClose}>
        <Typography>Завершить настройку</Typography>
      </button>
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
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpen = useCallback(() => setDialogOpen(true), []);
  const handleClose = useCallback(() => setDialogOpen(false), []);

  return (
    <>
      <Button variant="outlined" onClick={handleOpen}>
        Настроить экраны
      </Button>

      <Dialog open={dialogOpen} onClose={handleClose} TransitionComponent={Transition} fullScreen>
        <ReactFlowProvider>
          <PrototypeScreenSettingsContextProvider index={index}>
            <PrototypeScreenSetup screens={question.screens} onClose={handleClose} />
          </PrototypeScreenSettingsContextProvider>
        </ReactFlowProvider>
      </Dialog>
    </>
  );
};
