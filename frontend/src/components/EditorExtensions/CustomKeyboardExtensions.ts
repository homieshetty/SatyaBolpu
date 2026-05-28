import { Extension } from '@tiptap/core'

export const CustomKeyboardExtensions = Extension.create({
  name: 'preserveSpaces',

  addKeyboardShortcuts() {
    return {
      Space: ({ editor }) => {
        const { $from } = editor.state.selection;
        const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
        
        if (textBefore === '' || textBefore.endsWith(' ') || textBefore.endsWith('\u00A0')) {
          editor.commands.insertContent('\u00A0')
          return true;
        }
        
        return false;
      },
      Tab: () => {
        return this.editor.commands.insertContent('\u00A0\u00A0\u00A0\u00A0')
      },
    }
  },
})