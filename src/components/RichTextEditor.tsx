import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import React, { useState } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onBlur?: () => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  onBlur,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Add a description',
        showOnlyWhenEditable: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onBlur: () => {
      setIsFocused(false);
      if (onBlur) onBlur();
    },
    onFocus: () => setIsFocused(true),
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none min-h-[120px] w-full',
      },
    },
  });

  return (
    <div 
      className={`w-full transition-all duration-200 ${
        isFocused ? 'border rounded-md border-[#5036b0]' : 'border-none'
      }`}
      onClick={() => {
        if (!isFocused) {
          editor?.commands.focus();
        }
      }}
    >
      <div className={`${isFocused ? 'p-3' : 'p-0'}`}>
        <EditorContent 
          editor={editor} 
          className="prose max-w-none focus:outline-none"
        />
      </div>
      {isFocused && (
        <div className="border-t border-gray-200 p-2 bg-gray-50 flex gap-2">
          <button 
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`p-1 rounded ${editor?.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
          >
            B
          </button>
          <button 
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`p-1 rounded ${editor?.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
          >
            I
          </button>
          <button 
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`p-1 rounded ${editor?.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
          >
            •
          </button>
        </div>
      )}
    </div>
  );
};