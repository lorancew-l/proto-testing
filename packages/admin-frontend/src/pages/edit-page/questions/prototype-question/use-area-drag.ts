import { RefObject } from 'react';

import { useUpdateNodeInternals } from '@xyflow/react';

import { useScreenSetValue } from './prototype-screen-settings-context';

export const useAreaDrag = ({
  screenId,
  path,
  imageRef,
}: {
  screenId: string;
  path: `data.areas.${number}.rect`;
  imageRef: RefObject<HTMLElement | null>;
}) => {
  const { setFieldValue: setRect, getFieldValue: getCurrentRect } = useScreenSetValue(screenId, path);
  const updateNodeInternals = useUpdateNodeInternals();

  const startDrag = (event: React.MouseEvent) => {
    const image = imageRef.current;
    const rect = getCurrentRect();
    if (!image || !rect) return;

    event.stopPropagation();
    event.preventDefault();

    const imageRect = image.getBoundingClientRect();

    let startX = ((event.clientX - imageRect.left) / imageRect.width) * 100;
    let startY = ((event.clientY - imageRect.top) / imageRect.height) * 100;

    const dragStartRelativePos = { left: startX - rect.left, top: startY - rect.top };

    const moveRect = (event: MouseEvent) => {
      const imageRect = image.getBoundingClientRect();

      const eventX = ((event.clientX - imageRect.left) / imageRect.width) * 100;
      const eventY = ((event.clientY - imageRect.top) / imageRect.height) * 100;

      const deltaX = eventX - startX;
      const deltaY = eventY - startY;

      startX = eventX;
      startY = eventY;

      const prevRect = getCurrentRect();
      let left = Math.min(Math.max(prevRect.left + deltaX, 0), 100 - prevRect.width);
      let top = Math.min(Math.max(prevRect.top + deltaY, 0), 100 - prevRect.height);

      const currentRelativePos = { left: eventX - left, top: eventY - top };

      let blockXAxisMove = false;

      if (prevRect.left === 0) {
        const isCursorBeforeDragStartPos = currentRelativePos.left < dragStartRelativePos.left;
        if (isCursorBeforeDragStartPos) {
          blockXAxisMove = true;
        } else {
          left = eventX - dragStartRelativePos.left;
        }
      }

      if (prevRect.left + prevRect.width === 100) {
        const isCursorAfterDragStartPos = currentRelativePos.left > dragStartRelativePos.left;
        if (isCursorAfterDragStartPos) {
          blockXAxisMove = true;
        } else {
          left = eventX - dragStartRelativePos.left;
        }
      }

      let blockYAxisMove = false;

      if (prevRect.top === 0) {
        const isCursorBeforeDragStartPos = currentRelativePos.top < dragStartRelativePos.top;
        if (isCursorBeforeDragStartPos) {
          blockYAxisMove = true;
        } else {
          top = eventY - dragStartRelativePos.top;
        }
      }

      if (prevRect.top + prevRect.height === 100) {
        const isCursorAfterDragStartPos = currentRelativePos.top > dragStartRelativePos.top;
        if (isCursorAfterDragStartPos) {
          blockYAxisMove = true;
        } else {
          top = eventY - dragStartRelativePos.top;
        }
      }

      setRect({
        ...prevRect,
        left: blockXAxisMove ? prevRect.left : left,
        top: blockYAxisMove ? prevRect.top : top,
      });
      updateNodeInternals(screenId);
    };

    const stopDrag = () => {
      window.removeEventListener('mousemove', moveRect);
      window.removeEventListener('mouseup', stopDrag);
    };

    window.addEventListener('mousemove', moveRect);
    window.addEventListener('mouseup', stopDrag);
  };

  return { onMouseDown: startDrag };
};
