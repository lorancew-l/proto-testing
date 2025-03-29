import { useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

import { Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

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

  const { getRootProps, getInputProps, open } = useDropzone({
    accept: {
      'image/*': [],
    },
    maxFiles: 1,
    onDropAccepted: async (files) => {
      const [file] = files;
      if (file) {
        const base64Image = await toBase64(file);

        onImageUpload(base64Image);
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
          const blob = item.getAsFile();
          if (blob) {
            const base64Image = await toBase64(blob);
            onImageUpload(base64Image);
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

        <Typography fontWeight="bold" variant="h6" color="black">
          Добавьте изображение
        </Typography>
      </div>
    </section>
  );
};
