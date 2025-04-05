export interface BaseQuestion {
  id: string;
  text: string;
  requiresAnswer: boolean;
}

export interface BaseAnswer {
  id: string;
  text: string;
}

export interface SingleQuestionAnswer extends BaseAnswer {}
export interface SingleQuestion extends BaseQuestion {
  type: 'single';
  answers: SingleQuestionAnswer[];
}

export interface MultipleQuestionAnswer extends BaseAnswer {}
export interface MultipleQuestion extends BaseQuestion {
  type: 'multiple';
  answers: MultipleQuestionAnswer[];
}

export interface RatingQuestion extends BaseQuestion {
  type: 'rating';
  min: number;
  max: number;
}

export interface PrototypeArea {
  id: string;
  rect: { top: number; left: number; width: number; height: number };
  goToScreenId: string | null;
}
export interface PrototypeScreen {
  id: string;
  position: {
    x: number;
    y: number;
  };
  data: {
    description: string;
    imageSrc: string;
    areas: PrototypeArea[];
  };
}

export interface PrototypeQuestion extends BaseQuestion {
  type: 'prototype';
  screens: PrototypeScreen[];
}

export type Question = SingleQuestion | MultipleQuestion | RatingQuestion | PrototypeQuestion;

export interface Research {
  questions: Question[];
}
