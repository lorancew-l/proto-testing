import { useEffect, useRef, useState } from 'react';

import { useReactFlow } from '@xyflow/react';
import { nanoid } from 'nanoid';

import { useScreenSetValue, useScreenWatch } from './prototype-screen-context';

const minimumAreaSideSizePx = 20;

export function useDrawArea(id: string) {
  const imageSrc = useScreenWatch(id, 'data.imageSrc');
  const { setFieldValue: setAreas, getFieldValue: getCurrentAreas } = useScreenSetValue(id, 'data.areas');

  const imageRef = useRef<HTMLImageElement | null>(null);
  const [areaGhost, setAreaGhost] = useState<{ xStart: number; yStart: number; xEnd: number; yEnd: number } | null>(null);
  const currentAreaGhost = useRef(areaGhost);
  currentAreaGhost.current = areaGhost;

  const { getZoom } = useReactFlow();

  const calculateAreaRect = () => {
    const image = imageRef.current;
    const areaGhost = currentAreaGhost.current;

    if (image && areaGhost) {
      const imageRect = image.getBoundingClientRect();
      const zoom = getZoom();

      return {
        top: (Math.min(areaGhost.yStart, areaGhost.yEnd) / (imageRect.height / zoom)) * 100,
        left: (Math.min(areaGhost.xStart, areaGhost.xEnd) / (imageRect.width / zoom)) * 100,
        width: (Math.abs(areaGhost.xStart - areaGhost.xEnd) / (imageRect.width / zoom)) * 100,
        height: (Math.abs(areaGhost.yStart - areaGhost.yEnd) / (imageRect.height / zoom)) * 100,
      };
    }
  };

  const isCurrentAreaValid = () => {
    const rect = calculateAreaRect();
    const imageRect = imageRef.current?.getBoundingClientRect();

    if (
      !rect ||
      !imageRect ||
      rectIntersection(
        rect,
        getCurrentAreas().map((area) => area.rect),
      )
    ) {
      return false;
    }

    return (
      (rect.width / 100) * imageRect.width > minimumAreaSideSizePx &&
      (rect.height / 100) * imageRect.height > minimumAreaSideSizePx
    );
  };

  useEffect(() => {
    const image = imageRef.current;

    if (!image) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return;
      const startX = event.offsetX;
      const startY = event.offsetY;

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      setAreaGhost({ xStart: startX, yStart: startY, xEnd: startX, yEnd: startY });
    };

    const handleMouseMove = (event: MouseEvent) => {
      const imageRect = image.getBoundingClientRect();
      const zoom = getZoom();

      const x = Math.min(Math.max(event.clientX - imageRect.left, 0), imageRect.width) / zoom;
      const y = Math.min(Math.max(event.clientY - imageRect.top, 0), imageRect.height) / zoom;

      setAreaGhost((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          xEnd: x,
          yEnd: y,
        };
      });
    };

    const handleMouseUp = () => {
      const rect = calculateAreaRect();
      if (rect && isCurrentAreaValid()) {
        setAreas((areas) => [
          ...areas,
          {
            id: nanoid(10),
            goToScreenId: null,
            goToSide: null,
            rect,
          },
        ]);
      }

      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setAreaGhost(null);
    };

    image.addEventListener('mousedown', handleMouseDown);
    return () => {
      image.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [imageSrc]);

  return { imageRef, areaGhost: calculateAreaRect(), isAreaGhostValid: isCurrentAreaValid() };
}

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

function rectIntersection(rect: Rect, rects: Rect[]): boolean {
  return rects.some((r) => {
    return (
      rect.left < r.left + r.width &&
      rect.left + rect.width > r.left &&
      rect.top < r.top + r.height &&
      rect.top + rect.height > r.top
    );
  });
}
