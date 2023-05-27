<script setup lang="ts">
import { MotionInstance } from '@vueuse/motion'
import {
  Placement,
  arrow,
  computePosition,
  flip,
  offset,
  shift,
  size,
} from '@floating-ui/dom'

// TYPES
import type { IMenuProps } from '~/components/Menu/types/menu-props.type'

// FLOATING UI MIDDLEWARE
import { fitWidth } from '~/utils/floatingMiddleware/fitWidth'
import { matchWidth } from '~/utils/floatingMiddleware/matchWidth'
import { cover } from '~/utils/floatingMiddleware/cover'

// STORE
import { useAppStore } from '~/libs/App/app.store'

const props = withDefaults(defineProps<IMenuProps>(), {
  offset: 8,
  maxHeight: 99999,
  noArrow: true,
  fit: true,
  noOverlay: true,
  transitionDuration: 250,
  trigger: 'click',
})

const emits = defineEmits<{
  (e: 'update:model-value', val: boolean): void
  (e: 'hide'): void
  (e: 'show'): void
  (e: 'placement', placement: Placement): void
  (e: 'before-hide'): void
  (e: 'before-show'): void
}>()

// STORE
const appStore = useAppStore()

// HELPERS
const { $dimensions } = useNuxtApp()
const { color } = useTheme()

async function createFloatInstance() {
  if (!referenceEl.value) {
    return
  }

  await nextTick()

  // VIRTUAL ELEMENT ~ will create the menu in the last pointer down event position
  let virtualEl: any

  if (props.virtual && appStore.lastPointerDownEvent) {
    const { clientX, clientY } = appStore.lastPointerDownEvent

    virtualEl = {
      getBoundingClientRect() {
        return {
          width: 0,
          height: 0,
          x: clientX,
          y: clientY,
          top: clientY,
          left: clientX,
          right: clientX,
          bottom: clientY,
        }
      },
    }
  }

  const referenceElement = virtualEl || referenceEl.value

  if (!referenceElement) {
    return
  }

  const { x, y, middlewareData, placement } = await computePosition(
    referenceElement,
    menuEl.value!,
    {
      middleware: [
        offset(props.offset),
        shift(),

        flip({
          fallbackPlacements: props.fallbackPlacements,
        }),
        size({
          apply({ availableWidth, availableHeight, elements }) {
            Object.assign(elements.floating.style, {
              maxWidth: `${availableWidth}px`,
              maxHeight:
                typeof props.maxHeight === 'number'
                  ? `${Math.min(availableHeight, props.maxHeight)}px`
                  : `min(${availableHeight}px, ${props.maxHeight})`,
            })
          },
          padding: 8,
          boundary: props.boundary,
        }),

        ...(props.fit ? [fitWidth] : []),
        ...(props.matchWidth ? [matchWidth] : []),
        ...(props.cover ? [cover] : []),

        ...(!props.noArrow && !props.cover
          ? [arrow({ element: arrowEl.value!, padding: 4 })]
          : []),
      ],
      placement: props.placement,
      strategy: 'fixed',
    }
  )

  if (!preventMotion.value) {
    handleAnimation(placement)
  }

  Object.assign(menuEl.value!.style, {
    top: `${Math.round(y)}px`,
    left: `${Math.round(x)}px`,
  })

  emits('placement', placement)
  menuEl.value!.setAttribute('placement', props.cover ? 'center' : placement)

  if (!props.cover && !props.noArrow) {
    const { x: arrowX, y: arrowY } = middlewareData.arrow || {}
    Object.assign(arrowEl.value!.style, {
      top: `${arrowY}px`,
      left: `${arrowX}px`,
    })
  }
}

function getTargetElement(target: any): any {
  if (!process.client) {
    return
  }

  // TARGET IS AN ELEMENT
  if (target instanceof Element) {
    return target as Element
  }

  // TARGET IS A SELECTOR
  else if (typeof target === 'string') {
    return document?.querySelector(target) || document?.body || undefined
  }

  // TARGET IS VUE COMPONENT
  else if (target) {
    const el = unrefElement(target)

    if (el) {
      return el
    }
  }

  return instance?.vnode.el?.parentNode
}

// LAYOUT
const instance = getCurrentInstance()
const menuEl = ref<HTMLDivElement>()
const arrowEl = ref<HTMLDivElement>()
const triggerEl = ref<HTMLDivElement>() // Element that triggers the menu
const referenceEl = ref<Element>() // Element that menu is attached to
const backdropBg = ref('bg-transparent')
const isReferenceElTransparent = ref(false)
const referenceElOldZIndex = ref<string>()
const isFirstFloatingEl = ref<boolean>()

const isOverlayVisible = computedEager(() => {
  return !props.noOverlay && isFirstFloatingEl.value
})

const innerClasses = computedEager(() => {
  return {
    contentClass: props.dense ? '' : 'p-x-3 p-y-2',
    headerClass: props.dense ? '' : 'p-l-3 p-r-1',
  }
})

// ANIMATIONS
const animationTimestamp = ref<{ show: number; hide: number }>({
  show: 0,
  hide: 0,
})
const motionInstance = ref<MotionInstance | undefined>()
const animationTimeCorrection = 50

function handleAnimation(placement: Placement) {
  setTimeout(() => (backdropBg.value = 'bg-darker/80'))

  // RESET TRANSFORM ORIGIN
  menuEl.value?.classList.forEach(
    c => c.startsWith('origin-') && menuEl.value?.classList.remove(c)
  )

  // DEFAULT INITIAL STATE
  const opacity = 0.4
  let scaleY = 0.4
  let scaleX = props.cover ? 0.4 : 1

  // SET TRANSFORM ORIGIN
  let transformOrigin: string
  let originModifier = 0

  switch (placement) {
    case 'bottom':
    case 'bottom-end':
    case 'bottom-start': {
      transformOrigin = 'origin-top'
      originModifier = -1
      break
    }

    case 'top':
    case 'top-end':
    case 'top-start': {
      transformOrigin = 'origin-bottom'
      originModifier = 1
      break
    }

    default:
      transformOrigin = 'origin-bottom'
  }

  if (props.cover) {
    transformOrigin = 'origin-center'
    originModifier = 0
  }

  if (props.noTransition) {
    originModifier = 0
    scaleX = 1
    scaleY = 1
  }

  menuEl.value?.classList.add(transformOrigin)

  if (!motionInstance.value) {
    // @ts-expect-error vue-motion type
    motionInstance.value = useMotion(menuEl, {
      initial: {
        y:
          originModifier * (referenceEl.value!.clientHeight / 2 + props.offset),
        opacity,
        scaleY,
        scaleX,
      },
      enter: {
        y: 0,
        x: 0,
        opacity: 1,
        scaleY: 1,
        scaleX: 1,
        transition: {
          type: 'keyframes',
          duration: props.transitionDuration,
          ease: 'easeOut',
        },
      },
      leave: {
        y:
          originModifier * (referenceEl.value!.clientHeight / 2 + props.offset),
        opacity: 0,
        scaleX,
        scaleY,
        transition: {
          duration: props.transitionDuration,
          type: 'keyframes',
          ease: 'easeOut',
        },
      },
    })

    motionInstance.value?.apply('enter')?.then(() => {
      emits('show')
      emits('update:model-value', true)
    })
  }
}

async function bounce() {
  await motionInstance.value?.apply({
    scaleX: 1.05,
    scaleY: 1.05,
    transition: {
      type: 'keyframes',
      duration: 50,
    },
  })

  await motionInstance.value?.apply('enter')
}

// INTERACTIONS
const preventInteractions = refAutoReset(false, 75)
const preventMotion = refAutoReset(false, 25)
const model = toRef(props, 'modelValue')
const internalValue = ref(props.modelValue)

function show(force?: boolean) {
  if (preventInteractions.value || (internalValue.value && !force)) {
    return
  }

  isFirstFloatingEl.value = !document.querySelector(
    '.floating-element:not(.is-hiding)'
  )

  const referenceElStyle = getComputedStyle(referenceEl.value as any)
  referenceElOldZIndex.value =
    referenceElStyle.zIndex === 'auto' ? '' : referenceElStyle.zIndex

  // TODO: Overlay zIndex -> this doesnt work properly when dealing with zIndexes,
  // probably create a copy of the button and temporarily show that instead?
  if (!props.cover && !props.noUplift) {
    ;(referenceEl.value as any).style.zIndex = '3001'
  }

  isReferenceElTransparent.value =
    referenceElStyle.backgroundColor === 'rgba(0, 0, 0, 0)'
  if (isReferenceElTransparent.value && color.value === 'light') {
    ;(referenceEl.value as any).classList.add('bg-white')
  }

  preventInteractions.value = true

  internalValue.value = true
  emits('before-show')

  // IDLE
  if (!motionInstance.value) {
    animationTimestamp.value.show = new Date().getTime()
    createFloatInstance()
  }

  // Motion instance exists ~ menu is being currently closed
  else {
    animationTimestamp.value.show = new Date().getTime()
    const diffTime = Math.min(
      new Date().getTime() -
        animationTimestamp.value.hide -
        animationTimeCorrection,
      props.transitionDuration
    )

    // @ts-expect-error vue-motion type
    motionInstance.value.variants.enter.transition.duration =
      props.transitionDuration - diffTime
    motionInstance.value.apply('enter')?.then(() => {
      internalValue.value = true
      emits('show')
    })
  }
}

function hide(force = false, skipAnimation = false) {
  if (preventInteractions.value || !internalValue.value) {
    return
  }
  preventInteractions.value = true

  if (force || !props.persistent) {
    backdropBg.value = 'bg-transparent'
    emits('before-hide')

    // Component got unmounted (animation has nothing to attach to)
    if (skipAnimation) {
      cleanComponent()
      emits('update:model-value', false)
      emits('hide')
    }

    // Call leave animation and eventually remove the menu
    else {
      // internalValue.value = false
      menuEl.value?.classList.add('is-hiding')
      animationTimestamp.value.hide = new Date().getTime()
      const diffTime = Math.min(
        new Date().getTime() -
          animationTimestamp.value.show -
          animationTimeCorrection,
        props.transitionDuration
      )

      if (motionInstance.value) {
        // @ts-expect-error vue-motion type
        motionInstance.value.variants.leave.transition.duration = diffTime

        motionInstance.value.apply('leave')?.then(() => {
          emits('update:model-value', false)
          emits('hide')
          cleanComponent()
          nextTick(() => (backdropBg.value = 'bg-transparent'))
        })
      }
    }
  } else {
    bounce()
  }
}

function toggle(val?: boolean | MouseEvent) {
  if (typeof val !== 'boolean') {
    val?.preventDefault()
    val?.stopPropagation()
  }

  if (val !== undefined && typeof val === 'boolean') {
    val ? show() : hide()
  } else {
    internalValue.value ? hide() : show()
  }
}

/**
 * Remove all menu-related stuff to not clutter the runtime
 */
function cleanComponent() {
  if (referenceEl.value) {
    ;(referenceEl.value as any).style.zIndex = referenceElOldZIndex.value
    referenceElOldZIndex.value = undefined

    if (isReferenceElTransparent.value) {
      ;(referenceEl.value as any).classList.remove('bg-white')
    }
  }

  menuEl.value?.classList.remove('is-hiding')
  internalValue.value = false
  motionInstance.value = undefined
}

watch($dimensions, () => hide(true, true))

useEventListener(['mousedown', 'touchend'], handleClickOutside)

function handleClickOutside(ev: Event) {
  if (!internalValue.value) {
    return
  }

  const targetEl = ev.target as HTMLElement

  const isPartOfFloatingUI = menuEl.value?.contains(targetEl)
  const isPartOfReferenceEl =
    !props.virtual && referenceEl.value!.contains(targetEl)
  const lastFloatingElement = document.querySelector(
    '.floating-element:last-child'
  )

  if (
    !isPartOfFloatingUI &&
    !isPartOfReferenceEl &&
    lastFloatingElement === menuEl.value
  ) {
    hide()
  }
}

useMutationObserver(
  menuEl,
  () => {
    if (menuEl.value?.hasAttribute('hide-trigger')) {
      hide()

      menuEl.value?.removeAttribute('hide-trigger')
    }
  },
  { attributeFilter: ['hide-trigger'] }
)

watch(model, val => {
  val ? show() : hide(true)
})

// LIFECYCLE
onMounted(() => {
  nextTick(() => {
    triggerEl.value = getTargetElement(props.target)
    referenceEl.value = getTargetElement(props.referenceTarget)
    referenceEl.value && referenceEl.value.classList.add('has-menu')

    !props.manual && triggerEl.value?.addEventListener(props.trigger, toggle)

    if (internalValue.value) {
      show(true)
    }
  })
})

// WATCHERS FOR ELEMENTS
const referenceTarget = toRef(props, 'referenceTarget')
const target = toRef(props, 'target')

watch(referenceTarget, (el: any) => {
  if (el) {
    referenceEl.value = el
  }
})

watch(target, (el: any) => {
  if (el) {
    triggerEl.value = el
  }
})

onBeforeUnmount(() => {
  cleanComponent()
  triggerEl.value?.removeEventListener(props.trigger, toggle)
})

defineExpose({
  show,
  hide,
  toggle,
  update: () => {
    preventMotion.value = true
    bounce()
    createFloatInstance()
  },
})

defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <Teleport
    v-if="internalValue || motionInstance?.isAnimating"
    to="body"
  >
    <!-- OVERLAY -->
    <div
      v-if="isOverlayVisible"
      class="backdrop"
      :class="backdropBg"
      :style="{ '--transition': `${transitionDuration}ms` }"
    />

    <div
      ref="menuEl"
      class="menu floating-element"
      v-bind="$attrs"
    >
      <!-- ARROW -->
      <div
        v-if="!noArrow"
        ref="arrowEl"
        class="arrow"
        :class="{
          'bg-ca': !hideHeader,
          'has-header': !hideHeader,
        }"
      />

      <!-- HEADER -->
      <slot
        name="header"
        :hide="hide"
      >
        <div
          v-if="!hideHeader"
          flex="~"
          h="12"
          items-center
          border="b-1 ca"
          bg="ca"
          shrink-0
          rounded="t-inherit"
          :class="[innerClasses.headerClass, headerClass]"
        >
          <h6
            flex="1"
            text="h6"
            p="r-2"
            truncate
          >
            <span>
              {{ title }}
            </span>
          </h6>

          <Btn
            preset="CLOSE"
            size="sm"
            @click="hide(true)"
          />
        </div>
      </slot>

      <div
        flex="~ col"
        overflow="auto"
        :class="[contentClass, innerClasses.contentClass]"
      >
        <slot :hide="hide"> ...Slot... </slot>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.menu {
  --apply: fixed max-w-95vw max-h-95% dark:bg-darker bg-white border-custom
    rounded-custom flex flex-col border-ca z-$zMenu;
}

.backdrop {
  --apply: fixed inset-0 z-$zBackdrop transition-background-color
    duration-$transition ease;
}

.arrow {
  --apply: absolute w-2 h-2 rotate-45 dark:bg-darker bg-white;

  &.has-header {
    --apply: bg-ca dark:bg-dark;
  }
}

.menu[placement^='top'] > .arrow {
  --apply: bottom--5px border-b-custom border-r-custom border-ca;
}

.menu[placement^='bottom'] > .arrow {
  --apply: top--5px border-t-custom border-l-custom border-ca;
}

.menu[placement^='left'] > .arrow {
  --apply: right--5px border-r-custom border-t-custom border-ca;
}

.menu[placement^='right'] > .arrow {
  --apply: left--5px border-l-custom border-b-custom border-ca;
}

// SELECTOR SPECIFIC
.selector.is-menu-width-matched {
  &.menu[placement^='bottom'] {
    --apply: rounded-t-0 border-t-0;
  }

  &.menu[placement^='top'] {
    --apply: rounded-b-0 border-b-0;
  }
}
</style>
