import { useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

import { CircularProgress, Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import { useUploadFileRequest } from '../../../../api';

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result?.toString() ?? '');
    reader.onerror = reject;
  });

const useStyles = makeStyles()((theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropzone: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    marginBottom: 0,
    borderRadius: theme.shape.borderRadius * 2,
    border: `2px dashed #d5d6da`,
    padding: theme.spacing(4),
    '&:hover': {
      border: `2px dashed ${theme.palette.primary.main}`,
    },
  },
}));

export const ImageUploader = ({ onImageUpload }: { onImageUpload: (src: string) => void }) => {
  const { classes } = useStyles();

  const { uploadFile, isLoading } = useUploadFileRequest();
  const { getRootProps, getInputProps, open } = useDropzone({
    accept: {
      'image/*': [],
    },
    maxFiles: 1,
    onDropAccepted: async (files) => {
      const [file] = files;
      if (file) {
        const result = await uploadFile(file);
        if (result?.url) {
          onImageUpload(result.url);
        }
      }
    },
    noClick: true,
  });

  const mouseOverDropzone = useRef(false);

  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      if (!mouseOverDropzone.current) return;

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

  return (
    <section
      className={classes.container}
      onMouseEnter={() => {
        mouseOverDropzone.current = true;
      }}
      onMouseLeave={() => {
        mouseOverDropzone.current = false;
      }}
    >
      <div {...getRootProps({ className: classes.dropzone })} onClick={open}>
        <input {...getInputProps()} />

        {isLoading ? (
          <CircularProgress />
        ) : (
          <Typography fontWeight="bold" variant="h6" color="black">
            Добавьте изображение
          </Typography>
        )}
      </div>
    </section>
  );
};
