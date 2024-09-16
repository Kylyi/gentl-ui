const instance = getCurrentInstance()

export function getTargetElement(target: any): any {
  if (!import.meta.client) {
    return
  }

  // Target is an element
  if (target instanceof Element) {
    return target as Element
  }

  // Target is a selector
  else if (typeof target === 'string') {

    // Class or ID selector
    if (target.startsWith('.') || target.startsWith('#')) {
      return document?.querySelector(target) || undefined
    }

    // Otherwise, assume it's a data-onboarding attribute value
    else {
      return document?.querySelector(`[data-onboarding="${target}"]`) || undefined
    }
  }

  // Target is Vue component
  else if (target) {
    const el = unrefElement(target)

    if (el) {
      return el
    }
  }

  return instance?.vnode.el?.parentNode
}

/**
 * Checks if an element is a nested element within a parent element.
 *
 * @returns Returns `true` if the child element is nested within the parent element, otherwise `false`.
 */
export function isNestedElement(parent: HTMLElement | null, child?: HTMLElement | null): boolean {
  if (!parent || !child) {
    return false
  }

  // Start with the child element
  let currentElement: HTMLElement | null = child

  // Traverse up the DOM tree
  while (currentElement !== null) {
    // If we find the parent, return true
    if (currentElement === parent) {
      return true
    }
    // Move to the parent of the current element
    currentElement = currentElement.parentElement
  }

  // If we've reached the top of the DOM without finding the parent, return false
  return false
}
function isElementInViewport(el: HTMLElement) {
  const target = getTargetElement(el)
  const rect = target.getBoundingClientRect()

  const result = (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )

  console.log('isElementInViewport', result)
  return result
}

export async function checkElementVisibility(target: any): Promise<boolean> {
  if(!target){
    console.log('Target not found')
    return new Promise(resolve => resolve(true))
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      const element = getTargetElement(target)
      if (!element) {
        resolve(false)

        return
      }

      // Check if the element or any of its ancestors have display: none
      let currentElement: HTMLElement | null = element

      while (currentElement) {
        const style = window.getComputedStyle(currentElement)

        if (style.display === 'none') {
          resolve(false)

          return
        }
        currentElement = currentElement.parentElement
      }

      // Check other CSS properties that might hide the element
      const style = window.getComputedStyle(element)
      if (
        style.visibility === 'hidden' ||
        style.opacity === '0' ||
        style.height === '0px' ||
        style.width === '0px'
      ) {
        resolve(false)

        return
      }

      // Check if the element is in the viewport
      resolve(isElementInViewport(element))

      // Timeout of 10ms to allow DOM elements to update, f.e. Menu component.
    }, 10)
  })
}
