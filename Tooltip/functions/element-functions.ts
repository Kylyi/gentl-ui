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
    rect.top >= 0
    && rect.left >= 0
    && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    && rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )

  return result
}

/**
 * Checks if a given element is visible in the DOM.
 *
 * This function determines the visibility of an element by checking:
 * 1. If the element exists.
 * 2. If the element or any of its ancestors have `display: none`.
 * 3. If the element has CSS properties that hide it.
 *
 * @returns `true` if the element is in DOM and visible by css (not viewport), `false` otherwise.
 */
export function isElementVisible(target: any): boolean {
  if (!target) {
    return true
  }
  const element = getTargetElement(target)
  if (!element) {
    return false
  }

  // Check if the element or any of its ancestors have display: none
  let currentElement: HTMLElement | null = element

  while (currentElement) {
    const style = window.getComputedStyle(currentElement)

    if (style.display === 'none') {
      return false
    }
    currentElement = currentElement.parentElement
  }

  // Check other CSS properties that might hide the element
  const style = window.getComputedStyle(element)
  if (
    style.visibility === 'hidden'
    || style.opacity === '0'
    || (style.height === '0px'
      && style.width === '0px')
  ) {
    return false
  }

  // Might not be in viewport
  return true
}

export async function waitForElementVisibility(target: any, maxAttempts = 50): Promise<boolean> {
  return new Promise(resolve => {
    let attempts = 0

    const checkVisibility = () => {
      attempts++
      const element = getTargetElement(target)

      if (!element) {
        if (attempts >= maxAttempts) {
          resolve(false)
          stop()
        }
        return
      }

      const isVisible = isElementVisible(element)

      if (isVisible) {
        resolve(true)
        stop()
      } else if (attempts >= maxAttempts) {
        resolve(false)
        stop()
      }
    }

    const throttledCheck = throttle(checkVisibility, 100)
    const { pause: stop } = useIntervalFn(throttledCheck, 200)
  })
}

/**
 * Recursively searches the DOM for an input, select, textarea or
 * other GENTLUI component value within the target.
 *
 * @param target The target element to search within.
 * @returns The value of the first found input element, or `null` if no input is found.
 */
export function getValueFromNestedInput(target: any): string | string[] | null {
  const element = getTargetElement(target)

  if (!element) {
    return null
  }

  // Base case: If the element is an input, select, or textarea
  if (
    element instanceof HTMLInputElement
    || element instanceof HTMLSelectElement
    || element instanceof HTMLTextAreaElement
  )
  {
    return element.value
  }

  // Selector
  if (element.getAttribute('data-onboarding') === 'selector') {
    const isMulti = !!element.querySelector('.is-multi')

    if (isMulti) {
      return Array
        .from(element.querySelectorAll('[data-onboarding="chip-label"]'))
        .map(el => (el as HTMLElement).innerHTML) as string[]
    } else {
      return element.querySelector('[data-onboarding="selector-value"]').innerHTML as string
    }
  }

  // Recursively search child nodes
  const children = element.children
  for (let i = 0; i < children.length; i++) {
    const value = getValueFromNestedInput(children[i])

    if (value !== null) {
      return value
    }
  }

  return null
}
