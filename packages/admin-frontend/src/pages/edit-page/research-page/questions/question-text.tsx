import { useFieldController } from '../../store';
import { InlineRichEditor } from '../inline-rich-editor';

export const QuestionText = ({ path }: { path: `research.questions.${number}.text` }) => {
  const { value, onChange, ref } = useFieldController(path);

  return <InlineRichEditor value={value} onChange={onChange} placeholder="Введите текст вопроса" ref={ref} />;
};
