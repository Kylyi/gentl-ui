import type { MaybeElement, ReferenceElement } from '@floating-ui/vue'

export function useFloatingUIUtils() {
  function getElement(
    elRef?: MaybeRefOrGetter<
      MaybeElement<ReferenceElement> | HTMLElement | string | null
    >
  ) {
    if (!process.client) {
      return
    }

    const el = toValue(elRef)

    if (el === null) {
      return null
    }

    // When the string selector is provided, we need to find the element in the DOM
    if (typeof el === 'string') {
      return document.querySelector(el)
    }

    // When the element is already a DOM element, we just use it
    else if (el instanceof HTMLElement) {
      return el
    }

    // Otherwise, we assume it's a reference element
    // @ts-expect-error - We know it's a reference element
    return unrefElement(el)
  }

  return {
    getElement,
  }
}
