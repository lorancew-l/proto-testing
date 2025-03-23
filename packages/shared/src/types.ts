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

export type Question = SingleQuestion | MultipleQuestion | RatingQuestion;

export interface Research {
  id: string;
  data: {
    questions: Question[];
  };
}
