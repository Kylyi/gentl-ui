import { mergeAttributes, Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { type SuggestionKeyDownProps } from '@tiptap/suggestion'

// Functions
import { useValueFormatterUtils } from '~/components/ValueFormatter/functions/useValueFormatterUtils'

// Injections
import { mentionEntityKey } from '~/components/Wysiwyg/provide/wysiwyg.provide'

// Constants
import { mentionItemsMap } from '~/components/Wysiwyg/constants/resolve-values.map'

// Components
import WysiwygImage from '~/components/Wysiwyg/WysiwygImage.vue'

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

        const value =
          definition.format?.(entity) ??
          formatValue(get(entity || {}, definition.id), undefined, {
            dataType: definition.dataType,
          }) ??
          `\${${attrValue}}`

        const spanEl = document.createElement('span')
        spanEl.innerText = value

        el.replaceWith(spanEl)
      }
    })
  }

  function ImageComponent() {
    return Node.create({
      name: 'wisywigImage',
      group: 'block',
      // content: 'block*',
      draggable: true,
      atom: true,
      parseHTML() {
        return [
          { tag: 'wysiwyg-image' },
        ]
      },
      renderHTML({ HTMLAttributes }) {
        return [
          'wysiwyg-image',
          mergeAttributes(HTMLAttributes, { 'data-type': 'draggable-item' })
        ]
      },
      addAttributes() {
        return {
          uuid: {
            default: '',
          },
        }
      },
      addNodeView() {
        return VueNodeViewRenderer(WysiwygImage)
      },
    })
  }

  return {
    resolveValues,
    ImageComponent
  }
}
