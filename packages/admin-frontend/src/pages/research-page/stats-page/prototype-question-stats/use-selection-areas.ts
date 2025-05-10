import { useEffect, useRef, useState } from 'react';

import { nanoid } from 'nanoid';

export interface SelectionArea {
  id: string;
  top: number;
  left: number;
  width: number;
  height: number;
}

const minimumAreaSideSizePx = 20;

export function useSelectionAreas({ screenId, disabled }: { screenId: string; disabled?: boolean }) {
  const [areas, setAreas] = useState<SelectionArea[]>([]);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [areaPreview, setAreaPreview] = useState<{ xStart: number; yStart: number; xEnd: number; yEnd: number } | null>(null);
  const currentAriaPreview = useRef(areaPreview);
  currentAriaPreview.current = areaPreview;

  const calculateAreaRect = () => {
    const image = imageRef.current;
    const areaPreview = currentAriaPreview.current;

    if (image && areaPreview) {
      const imageRect = image.getBoundingClientRect();

      return {
        top: (Math.min(areaPreview.yStart, areaPreview.yEnd) / imageRect.height) * 100,
        left: (Math.min(areaPreview.xStart, areaPreview.xEnd) / imageRect.width) * 100,
        width: (Math.abs(areaPreview.xStart - areaPreview.xEnd) / imageRect.width) * 100,
        height: (Math.abs(areaPreview.yStart - areaPreview.yEnd) / imageRect.height) * 100,
      };
    }
  };

  const isCurrentAreaValid = () => {
    const rect = calculateAreaRect();
    const imageRect = imageRef.current?.getBoundingClientRect();

    return (
      rect &&
      imageRect &&
      (rect.width / 100) * imageRect.width > minimumAreaSideSizePx &&
      (rect.height / 100) * imageRect.height > minimumAreaSideSizePx
    );
  };

  const deleteArea = (areaId: string) => {
    setAreas((prevAreas) => prevAreas.filter((area) => area.id !== areaId));
  };

  useEffect(() => {
    setAreas([]);

    if (disabled) {
      return;
    }

    const image = imageRef.current;

    if (!image) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return;
      const startX = event.offsetX;
      const startY = event.offsetY;

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      setAreaPreview({ xStart: startX, yStart: startY, xEnd: startX, yEnd: startY });
    };

    const handleMouseMove = (event: MouseEvent) => {
      const imageRect = image.getBoundingClientRect();
      const x = Math.min(Math.max(event.clientX - imageRect.left, 0), imageRect.width);
      const y = Math.min(Math.max(event.clientY - imageRect.top, 0), imageRect.height);

      setAreaPreview((prev) => {
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
            ...rect,
          },
        ]);
      }

      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setAreaPreview(null);
    };

    image.addEventListener('mousedown', handleMouseDown);
    return () => {
      image.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [disabled, screenId]);

  return { areas, imageRef, areaPreview: calculateAreaRect(), deleteArea };
}
