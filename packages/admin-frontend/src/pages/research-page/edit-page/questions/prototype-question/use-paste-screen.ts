import { useEffect } from 'react';

import { useUploadFileRequest } from '../../../../../api';

export const usePasteScreen = (onImageUpload: (imageSrc: string) => void) => {
  const { uploadFile } = useUploadFileRequest();

  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items ?? [];

      for (const item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            const result = await uploadFile(file);
            if (result?.url) onImageUpload(result.url);
          }

          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);
};
