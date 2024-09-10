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
      return document?.querySelector(target) || undefined;
    }

    // Otherwise, assume it's a data-onboarding attribute value
    else {
      return document?.querySelector(`[data-onboarding="${target}"]`) || undefined;
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
    return false;
  }

  // Start with the child element
  let currentElement: HTMLElement | null = child;

  // Traverse up the DOM tree
  while (currentElement !== null) {
    // If we find the parent, return true
    if (currentElement === parent) {
      return true;
    }
    // Move to the parent of the current element
    currentElement = currentElement.parentElement;
  }

  // If we've reached the top of the DOM without finding the parent, return false
  return false;
}
