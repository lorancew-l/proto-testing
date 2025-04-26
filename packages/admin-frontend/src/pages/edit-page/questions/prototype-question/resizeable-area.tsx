import { RefObject, useRef } from 'react';

import { PrototypeArea } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { getRelativeRectStyle } from './get-rect-style';
import { useScreenController } from './prototype-screen-context';

const useStyles = makeStyles()((theme) => ({
  resizeHandle: {
    width: 6,
    height: 6,
    position: 'absolute',
    backgroundColor: theme.palette.primary.dark,
    zIndex: 10,
    borderRadius: '50%',
  },
  verticalHandle: {
    position: 'absolute',
    left: 0,
    height: 8,
    width: '100%',
    cursor: 'ns-resize',
  },
  horizontalHandle: {
    position: 'absolute',
    top: 0,
    width: 8,
    height: '100%',
    cursor: 'ew-resize',
  },
  top: { top: 0 },
  right: { right: 0 },
  bottom: { bottom: 0 },
  left: { left: 0 },
  topLeft: { top: -3, left: -3, cursor: 'nwse-resize' },
  topRight: { top: -3, right: -3, cursor: 'nesw-resize' },
  bottomLeft: { bottom: -3, left: -3, cursor: 'nesw-resize' },
  bottomRight: { bottom: -3, right: -3, cursor: 'nwse-resize' },
  disabled: {
    cursor: 'default',
    pointerEvents: 'none',
  },
}));

export const ResizableArea = ({
  path,
  screenId,
  children,
  style,
  imageRef,
  selected,
}: {
  path: `data.areas.${number}.rect`;
  screenId: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  imageRef: RefObject<HTMLElement | null>;
  selected: boolean;
}) => {
  const { classes, cx } = useStyles();

  const { value: rect, onChange: onChangeRect, getCurrentValue: getCurrentRect } = useScreenController(screenId, path);

  const startRect = useRef<(PrototypeArea['rect'] & { mouseX: number; mouseY: number }) | null>(null);
  const resizeCorner = useRef<string | null>(null);

  const startResize = (corner: string, event: React.MouseEvent) => {
    const image = imageRef.current;
    const rect = getCurrentRect();
    if (!image || !rect) return;

    event.stopPropagation();
    event.preventDefault();

    const imageRect = image.getBoundingClientRect();

    startRect.current = {
      ...rect,
      mouseX: ((event.clientX - imageRect.left) / imageRect.width) * 100,
      mouseY: ((event.clientY - imageRect.top) / imageRect.height) * 100,
    };

    resizeCorner.current = corner;

    const stopResize = () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResize);
      startRect.current = null;
      resizeCorner.current = null;
    };

    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResize);
  };

  const resize = (event: MouseEvent) => {
    const originalRect = startRect.current;
    const image = imageRef.current;
    const corner = resizeCorner.current;

    if (!originalRect || !image) return;

    const imageRect = image.getBoundingClientRect();

    const {
      left: originalX,
      top: originalY,
      width: originalWidth,
      height: originalHeight,
      mouseX: originalMouseX,
      mouseY: originalMouseY,
    } = originalRect;

    let newWidth = originalWidth;
    let newHeight = originalHeight;
    let newX = originalX;
    let newY = originalY;

    const eventX = ((event.clientX - imageRect.left) / imageRect.width) * 100;
    const eventY = ((event.clientY - imageRect.top) / imageRect.height) * 100;

    const deltaX = eventX - originalMouseX;
    const deltaY = eventY - originalMouseY;

    switch (corner) {
      case 'top':
        if (newY + deltaY < 0) {
          newHeight = originalY + originalHeight;
          newY = 0;
        } else if (eventY > originalY + originalHeight) {
          resizeCorner.current = 'bottom';
          newY = originalY + originalHeight;
          newHeight = eventY - newY;
          startRect.current = {
            ...originalRect,
            top: newY,
            height: newHeight,
            mouseX: eventX,
            mouseY: eventY,
          };
        } else {
          newHeight = originalHeight - deltaY;
          newY = originalY + deltaY;
        }
        break;
      case 'right':
        if (eventX < originalX) {
          resizeCorner.current = 'left';
          newX = eventX;
          newWidth = originalX - eventX;
          startRect.current = {
            ...originalRect,
            left: newX,
            width: newWidth,
            mouseX: eventX,
            mouseY: eventY,
          };
        } else {
          newWidth = originalWidth + deltaX;
        }
        break;
      case 'bottom':
        if (eventY < originalY) {
          resizeCorner.current = 'top';
          newY = eventY;
          newHeight = originalY - eventY;
          startRect.current = {
            ...originalRect,
            top: newY,
            height: newHeight,
            mouseX: eventX,
            mouseY: eventY,
          };
        } else {
          newHeight = originalHeight + deltaY;
        }
        break;
      case 'left':
        if (newX + deltaX < 0) {
          newWidth = originalX + originalWidth;
          newX = 0;
        } else if (eventX > originalX + originalWidth) {
          resizeCorner.current = 'right';
          newX = originalX + originalWidth;
          newWidth = eventX - newX;
          startRect.current = {
            ...originalRect,
            left: newX,
            width: newWidth,
            mouseX: eventX,
            mouseY: eventY,
          };
        } else {
          newWidth = originalWidth - deltaX;
          newX = originalX + deltaX;
        }
        break;
      case 'bottom-right':
        if (eventX < originalX && eventY < originalY) {
          resizeCorner.current = 'top-left';
          newX = eventX;
          newY = eventY;
          newWidth = originalX - eventX;
          newHeight = originalY - eventY;
          startRect.current = {
            ...originalRect,
            left: newX,
            top: newY,
            width: newWidth,
            height: newHeight,
            mouseX: eventX,
            mouseY: eventY,
          };
        } else if (eventX < originalX) {
          resizeCorner.current = 'bottom-left';
          newX = eventX;
          newWidth = originalX - eventX;
          newHeight = originalHeight + deltaY;
          startRect.current = {
            ...originalRect,
            left: newX,
            top: newY,
            width: newWidth,
            height: newHeight,
            mouseX: eventX,
            mouseY: eventY,
          };
        } else if (eventY < originalY) {
          resizeCorner.current = 'top-right';
          newY = eventY;
          newHeight = originalY - eventY;
          newWidth = originalWidth + deltaX;
          startRect.current = {
            ...originalRect,
            top: newY,
            width: newWidth,
            height: newHeight,
            mouseX: eventX,
            mouseY: eventY,
          };
        } else {
          newWidth = originalWidth + deltaX;
          newHeight = originalHeight + deltaY;
        }
        break;
      case 'bottom-left':
        if (newX + deltaX < 0) {
          newWidth = originalX + originalWidth;
          newHeight = originalHeight + deltaY;
          newX = 0;
        } else if (eventY < originalY && eventX > originalX + originalWidth) {
          resizeCorner.current = 'top-right';
          newX = originalX + originalWidth;
          newY = eventY;
          newWidth = eventX - newX;
          newHeight = originalY - eventY;
          startRect.current = {
            ...originalRect,
            left: newX,
            top: newY,
            width: newWidth,
            height: newHeight,
            mouseX: eventX,
            mouseY: eventY,
          };
        } else if (eventX > originalX + originalWidth) {
          resizeCorner.current = 'bottom-right';
          newX = originalX + originalWidth;
          newWidth = eventX - newX;
          newHeight = originalHeight + deltaY;
          startRect.current = {
            ...originalRect,
            left: newX,
            width: newWidth,
            height: newHeight,
            mouseX: eventX,
            mouseY: eventY,
          };
        } else if (eventY < originalY) {
          resizeCorner.current = 'top-left';
          newX = eventX;
          newY = eventY;
          newWidth = originalWidth - deltaX;
          newHeight = originalY - eventY;
          startRect.current = {
            ...originalRect,
            left: newX,
            top: newY,
            width: newWidth,
            height: newHeight,
            mouseX: eventX,
            mouseY: eventY,
          };
        } else {
          newWidth = originalWidth - deltaX;
          newHeight = originalHeight + deltaY;
          newX = originalX + deltaX;
        }
        break;
      case 'top-right':
        if (newY + deltaY < 0) {
          newWidth = originalWidth + deltaX;
          newHeight = originalY + originalHeight;
          newY = 0;
        } else if (eventX < originalX && eventY > originalY + originalHeight) {
          resizeCorner.current = 'bottom-left';
          newX = eventX;
          newY = originalY + originalHeight;
          newWidth = originalX - eventX;
          newHeight = eventY - newY;
          startRect.current = {
            ...originalRect,
            left: newX,
            top: newY,
            width: newWidth,
            height: newHeight,
            mouseX: eventX,
            mouseY: eventY,
          };
        } else if (eventY > originalY + originalHeight) {
          resizeCorner.current = 'bottom-right';
          newY = originalY + originalHeight;
          newHeight = eventY - newY;
          newWidth = originalWidth + deltaX;
          startRect.current = {
            ...originalRect,
            top: newY,
            width: newWidth,
            height: newHeight,
            mouseX: eventX,
            mouseY: eventY,
          };
        } else if (eventX < originalX) {
          resizeCorner.current = 'top-left';
          newX = eventX;
          newY = eventY;
          newWidth = originalX - eventX;
          newHeight = originalHeight - deltaY;
          startRect.current = {
            ...originalRect,
            left: newX,
            top: newY,
            width: newWidth,
            height: newHeight,
            mouseX: eventX,
            mouseY: eventY,
          };
        } else {
          newWidth = originalWidth + deltaX;
          newHeight = originalHeight - deltaY;
          newY = originalY + deltaY;
        }
        break;
      case 'top-left':
        if (eventX > originalX + originalWidth && eventY > originalY + originalHeight) {
          resizeCorner.current = 'bottom-right';
          newX = originalX + originalWidth;
          newY = originalY + originalHeight;
          newWidth = eventX - newX;
          newHeight = eventY - newY;

          startRect.current = {
            left: newX,
            top: newY,
            width: newWidth,
            height: newHeight,
            mouseX: eventX,
            mouseY: eventY,
          };
          break;
        } else if (eventX > originalX + originalWidth) {
          resizeCorner.current = 'top-right';
          newX = originalX + originalWidth;
          newY = eventY;
          newWidth = eventX - newX;
          newHeight = originalHeight - deltaY;
          startRect.current = {
            ...originalRect,
            left: newX,
            top: newY,
            width: newWidth,
            height: newHeight,
            mouseX: eventX,
            mouseY: eventY,
          };
        } else if (eventY > originalY + originalHeight) {
          resizeCorner.current = 'bottom-left';
          newX = eventX;
          newY = originalY + originalHeight;
          newWidth = originalWidth - deltaX;
          newHeight = eventY - newY;
          startRect.current = {
            ...originalRect,
            left: newX,
            top: newY,
            width: newWidth,
            height: newHeight,
            mouseX: eventX,
            mouseY: eventY,
          };
        } else {
          if (newX + deltaX < 0) {
            newWidth = originalX + originalWidth;
            newX = 0;
          } else {
            newWidth = originalWidth - deltaX;
            newX = originalX + deltaX;
          }

          if (newY + deltaY < 0) {
            newHeight = originalY + originalHeight;
            newY = 0;
          } else {
            newHeight = originalHeight - deltaY;
            newY = originalY + deltaY;
          }
        }
        break;
      default:
        break;
    }

    const left = Math.min(Math.max(0, newX), 100);
    const top = Math.min(Math.max(0, newY), 100);

    onChangeRect({
      left,
      top,
      width: Math.min(newWidth, 100 - left),
      height: Math.min(newHeight, 100 - top),
    });
  };

  if (!rect) return null;

  const isCreatingRect = false;

  return (
    <div
      style={{
        ...getRelativeRectStyle(rect),
        ...style,
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {children}

        {selected && (
          <>
            <div
              className={cx(classes.verticalHandle, classes.top, { [classes.disabled]: isCreatingRect })}
              onMouseDown={(e) => startResize('top', e)}
            />
            <div
              className={cx(classes.horizontalHandle, classes.right, { [classes.disabled]: isCreatingRect })}
              onMouseDown={(e) => startResize('right', e)}
            />
            <div
              className={cx(classes.verticalHandle, classes.bottom, { [classes.disabled]: isCreatingRect })}
              onMouseDown={(e) => startResize('bottom', e)}
            />
            <div
              className={cx(classes.horizontalHandle, classes.left, { [classes.disabled]: isCreatingRect })}
              onMouseDown={(e) => startResize('left', e)}
            />

            <div
              className={cx(classes.resizeHandle, classes.topLeft, { [classes.disabled]: isCreatingRect })}
              onMouseDown={(e) => startResize('top-left', e)}
            />
            <div
              className={cx(classes.resizeHandle, classes.topRight, { [classes.disabled]: isCreatingRect })}
              onMouseDown={(e) => startResize('top-right', e)}
            />
            <div
              className={cx(classes.resizeHandle, classes.bottomLeft, { [classes.disabled]: isCreatingRect })}
              onMouseDown={(e) => startResize('bottom-left', e)}
            />
            <div
              className={cx(classes.resizeHandle, classes.bottomRight, { [classes.disabled]: isCreatingRect })}
              onMouseDown={(e) => startResize('bottom-right', e)}
            />
          </>
        )}
      </div>
    </div>
  );
};
