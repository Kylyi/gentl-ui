import { SuggestionKeyDownProps } from '@tiptap/suggestion'
import { useValueFormatterUtils } from '~/components/ValueFormatter/functions/useValueForamtterUtils'
import {
  mentionEntityKey,
  mentionItemsKey,
} from '~/components/Wysiwyg/provide/wysiwyg.provide'

export function useWysiwygUtils() {
  const { formatValue } = useValueFormatterUtils()
  const mentionEntity = injectStrict(mentionEntityKey, {})
  const mentionItems = injectStrict(mentionItemsKey, [])

  function resolveValues(view: SuggestionKeyDownProps['view']) {
    const mentionItemsDom = view.dom.querySelectorAll(
      'span[data-type="mention"]'
    )

    mentionItemsDom.forEach(item => {
      const id = item.getAttribute('data-id')!
      const mentionItem = toValue(mentionItems)?.find(item => item.id === id)

      if (!mentionItem) {
        return
      }

      const value =
        mentionItem.format?.(toValue(mentionEntity) || {}) ||
        formatValue(
          get(toValue(mentionEntity) || {}, mentionItem.id),
          undefined,
          { dataType: mentionItem.dataType }
        )

      const spanEl = document.createElement('span')
      spanEl.innerText = value

      item.replaceWith(spanEl)
    })
  }

  return {
    resolveValues,
  }
}
