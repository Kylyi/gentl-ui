export function useDomUtils() {
  function getOuterWidth(el?: HTMLElement, includeMargin?: boolean) {
    if (el) {
      let width = el.offsetWidth

      if (includeMargin) {
        const style = getComputedStyle(el)

        width +=
          Number.parseFloat(style.marginLeft) +
          Number.parseFloat(style.marginRight)
      }

      return width
    }

    return 0
  }

  function getOuterHeight(el?: HTMLElement, includeMargin?: boolean) {
    if (el) {
      let height = el.offsetHeight

      if (includeMargin) {
        const style = getComputedStyle(el)

        height +=
          Number.parseFloat(style.marginTop) +
          Number.parseFloat(style.marginBottom)
      }

      return height
    }

    return 0
  }

  return {
    getOuterWidth,
    getOuterHeight,
  }
}
