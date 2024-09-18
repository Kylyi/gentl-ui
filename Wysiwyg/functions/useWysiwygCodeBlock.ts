import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { mergeAttributes, Node } from '@tiptap/core'

// Components
import WysiwygCodeBlockComponent from '~/components/Wysiwyg/WysiwygCodeBlock.vue'

function WysiwygCodeBlock() {
  return Node.create({
    name: 'wysiwygCodeBlock',
    // group: 'block',
    content: 'text*',
    marks: '',
    draggable: false,
    code: true,
    defining: true,

    group: 'inline',
    inline: true, // Ensure the node is inline
    // atom: true,

    parseHTML() {
      return [
        // {
        //   tag: 'pre[data-type="wysiwyg-code-block"]',
        //   preserveWhitespace: 'full',
        // },
        // {
        //   tag: 'pre',
        //   preserveWhitespace: 'full',
        // },
        {
          tag: 'code',
          preserveWhitespace: 'full',
        },
      ]
    },

    renderHTML({ HTMLAttributes }) {
      return [
        'code',
        mergeAttributes(HTMLAttributes, { 'data-type': 'wysiwyg-code-block' }),
        0,
      ]
    },

    addAttributes() {
      return {
        language: {
          default: null,
          parseHTML: element => element.getAttribute('data-language'),
          renderHTML: attributes => {
            if (!attributes.language) {
              return {}
            }
            return { 'data-language': attributes.language }
          },
        },
      }
    },

    addNodeView() {
      return VueNodeViewRenderer(WysiwygCodeBlockComponent)
    },
  })
}

export function useWysiwygCodeBlock() {
  return { WysiwygCodeBlock }
}
