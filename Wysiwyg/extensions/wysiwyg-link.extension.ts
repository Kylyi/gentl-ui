import Link, { type LinkOptions } from '@tiptap/extension-link'

/**
 * Link https://tiptap.dev/api/marks/link
 */
export function WysiwygLink(
  options?: Partial<LinkOptions>,
) {
  return Link
    .extend({
      addKeyboardShortcuts() {
        return {
          ArrowRight: ({ editor }) => {
            if (!editor.isActive('link')) {
              return false
            }

            const { from, to, $anchor } = editor.state.selection
            const transaction = editor.state.tr

            // Check if the cursor is at the end of the link
            if ($anchor && $anchor.nodeAfter && $anchor.nodeAfter.isText) {
              return false
            }

            transaction.removeMark(from, to, editor.schema.marks.link)

            if ($anchor) {
              transaction.removeStoredMark(editor.schema.marks.link)
            }

            editor.view.dispatch(transaction)

            editor.chain().focus().insertContent(' ').run()

            return true
          },
        }
      },
    })
    .configure({
      openOnClick: false,
      protocols: ['ftp', 'mailto'],
      HTMLAttributes: {
        'class': 'link wysiwyg-link',
        'target': '_blank',
        'data-id': generateUUID(),
      },

      ...options,
    })
    .extend({
      parseHTML() {
        return [
          {
            tag: 'a[href]:not([data-type="wysiwyg-email-btn"])', // Exclude custom button nodes
          },
        ]
      },

      addAttributes() {
        return {
          ...this.parent?.(),

          id: {
            default: null,
            parseHTML: element => {
              return element.getAttribute('data-id')
            },
            renderHTML: attributes => {
              if (!attributes.id) {
                return {}
              }

              return {
                'data-id': attributes.id,
              }
            },
          },
        }
      },
    })
}
