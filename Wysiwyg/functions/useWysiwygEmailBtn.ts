import { mergeAttributes, Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'

// Components
import WysiwygEmailBtnComponent from '~/components/Wysiwyg/WysiwygEmailBtn.vue'

export type EmailButtonOptions = {
  HTMLAttributes: Record<string, any>
}

function WysiwygEmailBtn() {
  return Node.create<EmailButtonOptions>({
    name: 'emailButton',

    inline: true, // Ensures the node is inline

    group: 'inline',

    content: 'inline*', // Allows the node to contain inline content

    draggable: true, // Makes the node draggable

    selectable: true,

    atom: true,

    addAttributes() {
      return {
        href: { default: null },
        style: { default: '' },
        content: { default: '' },
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

    parseHTML() {
      return [
        {
          tag: 'a[data-type="wysiwyg-email-btn"]',
        },
      ]
    },

    renderHTML({ HTMLAttributes }) {
      return [
        'a',
        mergeAttributes(
          this.options.HTMLAttributes,
          HTMLAttributes,
          { 'data-type': 'wysiwyg-email-btn' },
        ),
        0, // Content placeholder
      ]
    },

    addNodeView() {
      // @ts-expect-error
      return VueNodeViewRenderer(WysiwygEmailBtnComponent)
    },
  })
}

export function useWysiwygEmailBtn() {
  return {
    WysiwygEmailBtn,
  }
}
