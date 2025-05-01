import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FieldPathValue, Path } from 'react-hook-form';

import { get, isFunction } from 'lodash';

import { Connection, Edge, OnNodesChange, applyNodeChanges, useReactFlow } from '@xyflow/react';
import { PrototypeScreen, generatePrototypeScreen } from 'shared';

import { Fields, useEditPageActions, useEditPageStore, useFieldController, useFieldWatch } from '../../store';

export type EdgeDisplayMode = 'hidden' | 'visible' | { screenId: string; mode: 'all' | 'in' | 'out' };

const PrototypeScreenContext = createContext<{
  path: `research.questions.${number}.screens`;
  index: number;
  edgeDisplayMode: EdgeDisplayMode;
  canDeleteScreen: boolean;
  setEdgeDisplayMode: (mode: EdgeDisplayMode | ((prevMode: EdgeDisplayMode) => EdgeDisplayMode)) => void;
  addEdge: (params: { source: string; sourceHandle?: string | null; target: string }) => void;
  deleteEdge: (edge: { source: string; sourceHandle?: string | null }) => void;
  addScreen: (imageSrc?: string) => void;
  toggleScreenStartMark: (screenId: string) => void;
  toggleScreenTargetMark: (screenId: string) => void;
  handlers: {
    onConnect: (params: Connection) => void;
    onReconnect: (oldEdge: Edge, newConnection: Connection) => void;
    onReconnectEnd: (_: unknown, edge: Edge) => void;
    onNodesChange: OnNodesChange<PrototypeScreen>;
  };
} | null>(null);

export const PrototypeScreenContextProvider = ({ index, children }: { index: number; children: React.ReactNode }) => {
  const {
    form: { getFieldValue, setFieldValue },
  } = useEditPageActions();
  const { screenToFlowPosition } = useReactFlow();
  const path = `research.questions.${index}.screens` as const;

  const [edgeDisplayMode, setEdgeDisplayMode] = useState<EdgeDisplayMode>('visible');

  const canDeleteScreen = useEditPageStore((state) => get(state, path, []).length > 1);

  const addScreen = useCallback((imageSrc: string = '') => {
    setFieldValue(path, [
      ...getFieldValue(path),
      generatePrototypeScreen(screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }), imageSrc),
    ]);
  }, []);

  const toggleScreenStartMark = useCallback(
    (screenId: string) => {
      const screens = getFieldValue(path);

      const nextScreens = screens.map((screen) => {
        return {
          ...screen,
          data: {
            ...screen.data,
            ...(screen.id === screenId
              ? {
                  startScreen: !screen.data.startScreen,
                  targetScreen: false,
                }
              : {
                  startScreen: false,
                }),
          },
        };
      });

      setFieldValue(path, nextScreens);
    },
    [path],
  );

  const toggleScreenTargetMark = useCallback(
    (screenId: string) => {
      const screens = getFieldValue(path);

      const nextScreens = screens.map((screen) => {
        return {
          ...screen,
          data: {
            ...screen.data,
            ...(screen.id === screenId
              ? {
                  startScreen: false,
                  targetScreen: !screen.data.targetScreen,
                }
              : {
                  targetScreen: false,
                }),
          },
        };
      });

      setFieldValue(path, nextScreens);
    },
    [path],
  );

  const getAreaPathFromEdge = useCallback(
    (edge: { source: string; sourceHandle?: string | null }) => {
      const { source: screenId, sourceHandle: areaId } = edge;
      if (!areaId) return null;

      const screens = getFieldValue(path);
      const screenIndex = screens.findIndex((screen) => screen.id === screenId);
      const screen = screens[screenIndex];

      if (!screen) return;

      const areaIndex = screen.data.areas.findIndex((area) => area.id === areaId);
      if (areaIndex === -1) return;

      const areaPath = `${path}.${screenIndex}.data.areas.${areaIndex}` as const;
      return areaPath;
    },
    [path],
  );

  const addEdge = useCallback(
    (params: { source: string; sourceHandle?: string | null; target: string; targetHandle?: string | null }) => {
      const areaPath = getAreaPathFromEdge(params);
      if (areaPath) {
        setFieldValue(`${areaPath}.goToScreenId`, params.target);
        if (params.targetHandle === 'left' || params.targetHandle === 'right' || params.targetHandle === null) {
          setFieldValue(`${areaPath}.goToSide`, params.targetHandle);
        }
      }
    },
    [getAreaPathFromEdge],
  );

  const deleteEdge = useCallback(
    (edge: { source: string; sourceHandle?: string | null }) => {
      const areaPath = getAreaPathFromEdge(edge);
      if (areaPath) setFieldValue(`${areaPath}.goToScreenId`, null);
    },
    [getAreaPathFromEdge],
  );

  const onNodesChange: OnNodesChange<PrototypeScreen> = useCallback(
    (changes) => {
      setFieldValue(path, applyNodeChanges(changes, getFieldValue(path)));
    },
    [path],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      addEdge(params);
      if (edgeDisplayMode === 'hidden') setEdgeDisplayMode('visible');
    },
    [addEdge, edgeDisplayMode],
  );

  const successfullyReconnected = useRef(false);

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      successfullyReconnected.current = true;
      deleteEdge(oldEdge);
      addEdge(newConnection);
    },
    [deleteEdge],
  );

  const onReconnectEnd = useCallback(
    (_: unknown, edge: Edge) => {
      if (!successfullyReconnected.current) {
        deleteEdge(edge);
      }
      successfullyReconnected.current = false;
    },
    [deleteEdge],
  );

  const value = useMemo(
    () =>
      ({
        path,
        index,
        addEdge,
        deleteEdge,
        addScreen,
        canDeleteScreen,
        edgeDisplayMode,
        setEdgeDisplayMode,
        toggleScreenStartMark,
        toggleScreenTargetMark,
        handlers: {
          onConnect,
          onReconnect,
          onReconnectEnd,
          onNodesChange,
        },
      }) as const,
    [
      path,
      index,
      addEdge,
      deleteEdge,
      addScreen,
      onConnect,
      onReconnect,
      onReconnectEnd,
      onNodesChange,
      edgeDisplayMode,
      setEdgeDisplayMode,
      toggleScreenStartMark,
      toggleScreenTargetMark,
      canDeleteScreen,
    ],
  );

  return <PrototypeScreenContext value={value}>{children}</PrototypeScreenContext>;
};

export const usePrototypeScreenContext = () => {
  const value = useContext(PrototypeScreenContext);
  if (!value) throw new Error('PrototypeScreenContext is required!');
  return value;
};

export const useScreenIndex = (screenId: string) => {
  const { path } = usePrototypeScreenContext();
  return useEditPageStore((state) => get(state, path, [])?.findIndex((screen) => screen.id === screenId));
};

const useScreenPath = <T extends Path<PrototypeScreen>>(screenId: string, field: T) => {
  const { path } = usePrototypeScreenContext();
  const index = useScreenIndex(screenId);
  return `${path}.${index}.${field}` as const;
};

export const useScreenController = <T extends Path<PrototypeScreen>>(screenId: string, field: T) => {
  const path = useScreenPath(screenId, field);
  return useFieldController(path);
};

export const useScreenWatch = <T extends Path<PrototypeScreen>>(screenId: string, field: T) => {
  const path = useScreenPath(screenId, field);
  return useFieldWatch(path);
};

export const useScreenSetValue = <T extends Path<PrototypeScreen>>(screenId: string, field: T) => {
  const {
    form: { getFieldValue, setFieldValue },
  } = useEditPageActions();
  const path = useScreenPath(screenId, field);

  return {
    getFieldValue: () => getFieldValue(path),
    setFieldValue: (
      value:
        | FieldPathValue<Fields, typeof path>
        | ((value: FieldPathValue<Fields, typeof path>) => FieldPathValue<Fields, typeof path>),
    ) => {
      if (isFunction(value)) {
        setFieldValue(path, value(getFieldValue(path)));
      } else {
        setFieldValue(path, value);
      }
    },
  };
};

export const useSubscribeScreenChanges = <T extends Path<PrototypeScreen>>(
  screenId: string,
  field: T,
  callback: (state: FieldPathValue<Fields, `research.questions.${number}.screens.${number}.${T}`>) => void,
) => {
  const path = useScreenPath(screenId, field);

  const actualCallback = useRef(callback);

  useEffect(() => {
    callback(get(useEditPageStore.getState() as any, path));

    return useEditPageStore.subscribe(
      (state) => get(state, path) as any,
      (state) => actualCallback.current(state),
    );
  }, [path]);
};
