import CheckBoxIcon from '@mui/icons-material/CheckBox';
import GradeIcon from '@mui/icons-material/Grade';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import WebIcon from '@mui/icons-material/Web';

import type { Question } from 'shared';

export const questionTypeToIcon: Record<Question['type'], React.ComponentType<{ className?: string }>> = {
  single: RadioButtonCheckedIcon,
  multiple: CheckBoxIcon,
  rating: GradeIcon,
  prototype: WebIcon,
};

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
