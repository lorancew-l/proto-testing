import { InlineRichEditor } from '../inline-rich-editor';
import { useFieldController } from '../store';

export const QuestionText = ({ path }: { path: `research.data.questions.${number}.text` }) => {
  const { value, onChange, ref } = useFieldController(path);

  return <InlineRichEditor value={value} onChange={onChange} placeholder="Введите текст вопроса" ref={ref} />;
};
