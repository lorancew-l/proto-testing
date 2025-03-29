type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export const getRelativeRectStyle = (rect: Rect) => {
  return {
    left: `${rect.left}%`,
    top: `${rect.top}%`,
    width: `${rect.width}%`,
    height: `${rect.height}%`,
    position: 'absolute',
  } as const;
};
