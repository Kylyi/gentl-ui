import type { OnboardingStep } from "../models/onboarding-step.model"

export function useOnboardingOverlay(el: MaybeRefOrGetter<HTMLElement | null>, step: MaybeRefOrGetter<OnboardingStep>) {
  window.addEventListener('resize', updateOverlayClip)

  const cleanup = ref<() => void>()

  const {
    x: elX,
    y: elY,
  } = useElementBounding(el, { windowResize: true })

  watchThrottled([elX, elY], updateOverlayClip, {
    trailing: true,
    throttle: 1,
  })

  async function updateOverlayClip() {
    if(!toValue(step).canInteractWithElement) {
      cleanup.value = await disableElementInteraction()
    }

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

  async function disableElementInteraction() {
    const referenceEl = toValue(el);
    if (!referenceEl) {
      return
    }

    // Wait for the element-overlay div to be rendered
    await nextTick()

    let elementOverlayEl = document.querySelector('.element-overlay') as HTMLDivElement;
    if (!elementOverlayEl) {
      elementOverlayEl = document.createElement('div');
      elementOverlayEl.className = 'element-overlay';
      document.body.appendChild(elementOverlayEl);
    }

    const updateOverlay = () => {
      if (!elementOverlayEl) {
        return
      }

      const rect = referenceEl.getBoundingClientRect();

      Object.assign(elementOverlayEl.style, {
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        display: 'block',
      });
    };

    // Initial update
    updateOverlay();

    // Update on scroll and resize
    window.addEventListener('scroll', updateOverlay);
    window.addEventListener('resize', updateOverlay);

    return () => {
      window.removeEventListener('scroll', updateOverlay);
      window.removeEventListener('resize', updateOverlay);
    };
  }

  onUnmounted(() => {
    window.removeEventListener('resize', updateOverlayClip)
    cleanup.value?.()
  })

  return {
    updateOverlayClip
  }
}
