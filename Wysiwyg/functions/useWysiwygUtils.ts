// Types
import type { IWysiwygProps } from '~/components/Wysiwyg/types/wysiwyg-props.type'

// Injections
import { wysiwygMentionPopulateKey } from '~/components/Wysiwyg/provide/wysiwyg.provide'

// Constants
import { useWysiwygStore } from '~/components/Wysiwyg/wysiwyg.store'

export function useWysiwygUtils() {
  // Injections
  const injectedPopulateFnc = inject(wysiwygMentionPopulateKey)

  // Store
  const wysiwygStore = useWysiwygStore()

  const transitionProps = computed(() => ({
    enterActiveClass: 'animate-fade-in animate-duration-150',
    leaveActiveClass: 'animate-fade-out animate-duration-150',
  }))

  function resolveMentions(
    populateFnc: IWysiwygProps['populateMention'],
    replace = false,
    props?: Pick<IWysiwygProps, 'populateMention' | 'onMentionResolve'>
      & { el?: HTMLElement },
  ) {
    const domEl = props?.el ?? wysiwygStore.editor?.view?.dom
    const _populateFnc = populateFnc ?? injectedPopulateFnc ?? props?.populateMention

    if (!domEl || !_populateFnc) {
      return
    }

    const elements = domEl.querySelectorAll('span[data-type="mention"]')

    elements.forEach(el => {
      const attrId = el.getAttribute('data-id')

      if (attrId) {
        const value = _populateFnc?.(attrId) ?? ''

        if (isUndefined(value) || value === '') {
          return
        }
        if (replace) {
          const spanEl = document.createElement('span')
          spanEl.textContent = value

          el.replaceWith(spanEl)
        } else {
          el.textContent = value
        }
      }
    })

    props?.onMentionResolve?.(domEl.innerHTML)
  }

  function removeElement(selector: string, wysiwygModel: Ref<any>) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(wysiwygStore.editor?.getHTML() ?? '', 'text/html')

    const node = doc.querySelector(selector)

    if (node) {
      node.remove()

      wysiwygStore.editor?.chain().setContent(doc.body.innerHTML).run()

      nextTick(() => {
        const editorValue = wysiwygStore.getEditorValue?.()
        wysiwygModel.value = editorValue
        wysiwygStore.editor?.chain().setContent(editorValue).run()
      })
    }
  }

  return {
    resolveMentions,
    transitionProps,
    removeElement,
  }
}
