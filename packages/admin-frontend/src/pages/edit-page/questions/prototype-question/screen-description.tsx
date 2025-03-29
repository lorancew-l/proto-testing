import { InlineRichEditor } from '../../inline-rich-editor';

import { useScreenController } from './prototype-screen-settings-context';

export const ScreenDescription = ({ screenId }: { screenId: string }) => {
  const { value, onChange, ref } = useScreenController(screenId, 'data.description');
  return <InlineRichEditor value={value ?? ''} onChange={onChange} placeholder="Описание экрана" ref={ref} />;
};
