import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import type { SuggestionKeyDownProps } from '@tiptap/suggestion'

// Functions
import { useValueFormatterUtils } from '~/components/ValueFormatter/functions/useValueFormatterUtils'

// Injections
import { mentionEntityKey } from '~/components/Wysiwyg/provide/wysiwyg.provide'

// Constants
import { mentionItemsMap } from '~/components/Wysiwyg/constants/resolve-values.map'

// Components
import WysiwygFile from '~/components/Wysiwyg/WysiwygFile.vue'

export function useWysiwygUtils() {
  const { formatValue } = useValueFormatterUtils()
  const mentionEntity = injectStrict(mentionEntityKey, {})

  function resolveValues(view: SuggestionKeyDownProps['view']) {
    const entity = toValue(mentionEntity)
    const elements = view.dom.querySelectorAll('span[data-type="mention"]')

    elements.forEach(el => {
      const attrValue = el.getAttribute('data-id')

      if (attrValue) {
        const definition = mentionItemsMap.get(attrValue)

        if (!definition) {
          return ''
        }

        const value
          = definition.format?.(entity)
          ?? formatValue(get(entity || {}, definition.id), undefined, {
            dataType: definition.dataType,
          })
          ?? `\${${attrValue}}`

        const spanEl = document.createElement('span')
        spanEl.innerText = value

        el.replaceWith(spanEl)
      }
    })
  }

  function FileComponent() {
    return Node.create({
      name: 'wysiwygFile',
      group: 'inline',
      inline: true, // Ensure the node is inline
      draggable: true,
      // atom: true,

      parseHTML() {
        return [
          {
            tag: 'span[data-type="wysiwyg-file"]',
          },
        ]
      },

      renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'wysiwyg-file' })]
      },

      addAttributes() {
        return {
          uuid: {
            default: '',
          },
          filepath: {
            default: '',
          },
        }
      },
      addNodeView() {
        return VueNodeViewRenderer(WysiwygFile)
      },

    })
  }

  return {
    resolveValues,
    FileComponent,
  }
}
