// Types
import type { IMenuProps } from '~/components/Menu/types/menu-props.type'

// Functions
import { useMenuUtils } from '~/components/Menu/functions/useMenuUtils'

// Store
import { useAppStore } from '~/libs/App/app.store'

export function useMenuLayout(model: Ref<boolean>, props: IMenuProps) {
  // Utils
  const instance = getCurrentInstance()
  const { getElement } = useMenuUtils()

  // Store
  const appStore = useAppStore()

  // Layout
  const floatingEl = ref<HTMLDivElement>()
  const arrowEl = ref<HTMLElement>()
  const referenceEl = ref<ReturnType<typeof getElement>>()
  const triggerEl = ref<ReturnType<typeof getElement>>()
  const contentEl = ref<HTMLElement>()
  const referenceElZIndex = ref<string>()
  const isReferenceElTransparent = ref(false)

  const virtualEl = computed(() => {
    if (!props.virtual || !appStore.lastPointerDownEvent) {
      return null
    }

    const { clientX, clientY } = appStore.lastPointerDownEvent

    return {
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        x: clientX,
        y: clientY,
        top: clientY,
        left: clientX,
        right: clientX,
        bottom: clientY,
      }),
    }
  })

  const floatingReferenceEl = computed(() => {
    if (props.virtual) {
      return virtualEl.value
    }

    return referenceEl.value
  })

  // Methods
  function toggle() {
    model.value = !model.value
  }

  /**
   * Refreshes the `referenceEl` and `triggerEl`
   */
  function refreshAnchors() {
    const parentEl = instance?.vnode?.el?.parentNode

    if (triggerEl.value instanceof HTMLElement) {
      triggerEl.value?.removeEventListener(props.trigger ?? 'click', toggle)
    }

    // Assign the elements
    triggerEl.value = getElement(props.target ?? parentEl)
    referenceEl.value = getElement(props.referenceTarget ?? parentEl)

    if (referenceEl.value && referenceEl.value instanceof HTMLElement) {
      referenceEl.value.classList.add('has-menu')

      const referenceElStyle = getComputedStyle(referenceEl.value)
      referenceElZIndex.value = referenceElStyle.zIndex
      isReferenceElTransparent.value =
        referenceElStyle.backgroundColor === 'rgba(0, 0, 0, 0)'
    }

    // Add event listeners when not using the `manual` mode
    if (!props.manual && triggerEl.value instanceof HTMLElement) {
      triggerEl.value?.addEventListener(props.trigger ?? 'click', toggle)
    }
  }

  // Watch for element changes
  watch([() => props.target, () => props.referenceTarget], () => {
    refreshAnchors()
  })

  // Lifecycle
  onMounted(async () => {
    await nextTick()
    refreshAnchors()
  })

  onBeforeUnmount(() => {
    if (triggerEl.value instanceof HTMLElement) {
      triggerEl.value?.removeEventListener(props.trigger ?? 'click', toggle)
    }
  })

  return {
    isReferenceElTransparent,
    referenceElZIndex,
    arrowEl,
    contentEl,
    floatingEl,
    floatingReferenceEl,
    referenceEl,
    refreshAnchors,
  }
}
