export function useOnboardingOverlay(el: MaybeRefOrGetter<HTMLElement | null>) {
  window.addEventListener('resize', updateOverlayClip)

  const {
    x: pageX,
    y: pageY,
  } = useElementBounding(el, { windowResize: true })

  watchThrottled([pageX, pageY], updateOverlayClip, {
    trailing: true,
    throttle: 1,
  })

  function updateOverlayClip() {

    if (isNil(toValue(el))) {
      return
    }

    const rect = toValue(el)!.getBoundingClientRect()
    const overlay = document.querySelector('.tutorial-overlay') as HTMLElement
    if (!overlay) {
      return
    }

    overlay.style.clipPath = `
      polygon(
        0% 0%,
        0% 100%,
        ${rect.left}px 100%,
        ${rect.left}px ${rect.top}px,
        ${rect.right}px ${rect.top}px,
        ${rect.right}px ${rect.bottom}px,
        ${rect.left}px ${rect.bottom}px,
        ${rect.left}px 100%,
        100% 100%,
        100% 0%
      )
    `
  }

  onUnmounted(() => {
    window.removeEventListener('resize', updateOverlayClip)
  })

  return {
    updateOverlayClip
  }
}
