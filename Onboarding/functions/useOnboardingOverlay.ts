import type { OnboardingStep } from "../models/onboarding-step.model"

export function useOnboardingOverlay(el: MaybeRefOrGetter<HTMLElement | null>, step: MaybeRefOrGetter<OnboardingStep>) {
  window.addEventListener('resize', updateOverlayClip)

  const {
    x: elX,
    y: elY,
  } = useElementBounding(el, { windowResize: true })

  watchThrottled([elX, elY], updateOverlayClip, {
    trailing: true,
    throttle: 1,
  })

  async function updateOverlayClip() {
    const overlay = document.querySelector('.tutorial-overlay') as HTMLElement
    if (!overlay) {
      return
    }

    if (isNil(toValue(el))) {
      overlay.style.clipPath = 'none'

      return
    }

    const rect = toValue(el)!.getBoundingClientRect()


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
