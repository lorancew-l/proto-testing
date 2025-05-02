import { Ref, useImperativeHandle, useRef } from 'react';

import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import { Paper } from '@mui/material';

import Placeholder from '@tiptap/extension-placeholder';
import { BubbleMenu, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { makeStyles } from 'tss-react/mui';

import './inline-rich-editor.css';

const useStyles = makeStyles()((theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  button: {
    all: 'unset',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: theme.spacing(1),
    '&:hover svg': {
      opacity: 0.7,
    },
    '&:not(:last-child):after': {
      content: '""',
      position: 'absolute',
      transform: 'translateX(-50%)',
      width: 1,
      height: '60%',
      right: theme.spacing(-0.5),
      backgroundColor: theme.palette.action.active,
    },
  },
  active: {
    color: theme.palette.primary.main,
  },
}));

export const InlineRichEditor = ({
  value,
  placeholder,
  onChange,
  ref,
  className,
}: {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  ref?: Ref<{ focus: VoidFunction; scrollIntoView: VoidFunction }>;
  className?: string;
}) => {
  const { classes } = useStyles();

  const editor = useEditor({
    content: value,
    extensions: [StarterKit, Placeholder.configure({ placeholder })],
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  const toggleBold = () => {
    editor?.chain().focus().toggleBold().run();
  };

  const toggleItalic = () => {
    editor?.chain().focus().toggleItalic().run();
  };

  const inputRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => editor?.commands.focus(),
      scrollIntoView: () => inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    }),
    [editor],
  );

  return (
    <>
      <EditorContent className={className} editor={editor} placeholder="placeholder" ref={inputRef} />
      <BubbleMenu editor={editor}>
        <Paper className={classes.container} elevation={2}>
          <ToolbarAction active={!!editor?.isActive('bold')} onClick={toggleBold}>
            <FormatBoldIcon />
          </ToolbarAction>

          <ToolbarAction active={!!editor?.isActive('italic')} onClick={toggleItalic}>
            <FormatItalicIcon />
          </ToolbarAction>
        </Paper>
      </BubbleMenu>
    </>
  );
};

const ToolbarAction = ({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: VoidFunction }) => {
  const { classes, cx } = useStyles();

  return (
    <button className={cx(classes.button, { [classes.active]: active })} onClick={onClick}>
      {children}
    </button>
  );
};
