// Functions
import { useValueFormatterUtils } from '~/components/ValueFormatter/functions/useValueFormatterUtils'

// Injections
import { mentionEntityKey } from '~/components/Wysiwyg/provide/wysiwyg.provide'

// Constants
import { mentionItemsMap } from '~/components/Wysiwyg/constants/resolve-values.map'
import { useWysiwygStore } from '~/components/Wysiwyg/wysiwyg.store'

export function useWysiwygUtils() {
  // Utils
  const mentionEntity = injectStrict(mentionEntityKey, {})
  const { formatValue } = useValueFormatterUtils()

  // Store
  const wysiwygStore = useWysiwygStore()

  const transitionProps = computed(() => ({
    enterActiveClass: 'animate-fade-in animate-duration-150',
    leaveActiveClass: 'animate-fade-out animate-duration-150',
  }))

  function resolveValues() {
    const view = wysiwygStore.editor?.view

    if (!view) {
      return
    }

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
          ?? formatValue(
            get(entity || {}, definition.id),
            undefined,
            { dataType: definition.dataType },
          )
          ?? `\${${attrValue}}`

        const spanEl = document.createElement('span')
        spanEl.innerText = value

        el.replaceWith(spanEl)
      }
    })
  }

  function removeElement(selector: string, wysiwygModel: Ref<any>) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(wysiwygStore.editor?.getHTML() ?? '', 'text/html')

    const node = doc.querySelector(selector)

    if (node) {
      node.remove()

      wysiwygStore.editor?.chain().setContent(doc.body.innerHTML).run()

      wysiwygModel.value = doc.body.innerHTML
    }
  }

  return {
    resolveValues,
    transitionProps,
    removeElement,
  }
}
