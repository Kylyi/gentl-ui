// Types
import type { IDialogProps } from '~/components/Dialog/types/dialog-props.type'

// Functions
import { useDialogUtils } from '~/components/Dialog/functions/useDialogUtils'

export function useDialogLayout(model: Ref<boolean>, props: IDialogProps) {
  // Utils
  const instance = getCurrentInstance()
  const { getElement } = useDialogUtils()

  // Layout
  const floatingEl = ref<HTMLDivElement>()
  const triggerEl = ref<ReturnType<typeof getElement>>()
  const contentEl = ref<HTMLElement>()
  const dialogWrapperEl = ref<HTMLElement>()

  function toggle() {
    model.value = !model.value
  }

  // Watch for element changes
  watch(
    () => props.target,
    () => {
      const parentEl = instance?.vnode?.el?.parentNode

      if (triggerEl.value instanceof HTMLElement) {
        triggerEl.value?.removeEventListener(props.trigger ?? 'click', toggle)
      }

      triggerEl.value = getElement(props.target ?? parentEl)

      // Add event listeners when not using the `manual` mode
      if (!props.manual && triggerEl.value instanceof HTMLElement) {
        triggerEl.value?.addEventListener(props.trigger ?? 'click', toggle)
      }
    }
  )

  // Lifecycle
  onMounted(async () => {
    await nextTick()

    const parentEl = instance?.vnode?.el?.parentNode

    // Assign the elements
    triggerEl.value = getElement(props.target ?? parentEl)

    // Add event listeners when not using the `manual` mode
    if (!props.manual && triggerEl.value instanceof HTMLElement) {
      triggerEl.value?.addEventListener(props.trigger ?? 'click', toggle)
    }
  })

  onBeforeUnmount(() => {
    if (triggerEl.value instanceof HTMLElement) {
      triggerEl.value?.removeEventListener(props.trigger ?? 'click', toggle)
    }
  })

  return {
    contentEl,
    dialogWrapperEl,
    floatingEl,
  }
}
