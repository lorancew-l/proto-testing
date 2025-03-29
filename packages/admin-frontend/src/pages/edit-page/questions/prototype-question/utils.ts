type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export function rectIntersection(rect: Rect, rects: Rect[]): boolean {
  return rects.some((r) => {
    return (
      rect.left < r.left + r.width &&
      rect.left + rect.width > r.left &&
      rect.top < r.top + r.height &&
      rect.top + rect.height > r.top
    );
  });
}

export const minimumAreaSideSizePx = 20;
