import { useCallback } from 'react';

import { UseFetch, useFetch } from './use-fetch';

export const useUploadFileRequest = (props?: UseFetch<{ url: string }>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const uploadFile = useCallback(
    (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      return fetchData('/api/upload/single', {
        method: 'POST',
        body: formData,
      });
    },
    [fetchData],
  );

  return {
    uploadFile,
    ...rest,
  };
};
