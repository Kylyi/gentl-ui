import { getTargetElement } from "~/components/Tooltip/functions/element-functions"
import type { OnboardingStep } from "../models/onboarding-step.model"

export function useOnboardingOverlay(step: MaybeRefOrGetter<OnboardingStep>) {
  window.addEventListener('resize', updateOverlayClip)

  const highlightEl = ref<HTMLElement>()
  const cleanup = ref<() => void>()

  const {
    x: elX,
    y: elY,
  } = useElementBounding(highlightEl, { windowResize: true })

  watchThrottled(
    [elX, elY, step],
    async () => {
      highlightEl.value = getTargetElement(toValue(step).element)
      updateOverlayClip()
      disableElementInteraction()
    },
    {
      trailing: true,
      throttle: 1,
      immediate: true
    }
  )

  async function updateOverlayClip() {
    const overlayEl = document.querySelector('.tutorial-overlay') as HTMLElement
    if (!overlayEl) {
      return
    }

    if (isNil(toValue(highlightEl))) {
      overlayEl.style.clipPath = 'none'

      return
    }

    const rect = toValue(highlightEl)!.getBoundingClientRect()


    overlayEl.style.clipPath = `
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
    if(toValue(step).canInteractWithElement) {
      return
    }

    const referenceEl = toValue(highlightEl);
    if (!referenceEl) {
      return
    }

    // Wait for the element-overlay div to be rendered
    await nextTick(() => {
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

      cleanup.value = () => {
        window.removeEventListener('scroll', updateOverlay);
        window.removeEventListener('resize', updateOverlay);
      };
    })
  }

  onUnmounted(() => {
    window.removeEventListener('resize', updateOverlayClip)
    cleanup.value?.()
  })

  return {
    updateOverlayClip
  }
}
