<script setup lang="ts">
import type { CSSProperties } from 'vue'

// Types
import type { IVerticalScrollPickerProps } from '~/components/ScrollPicker/types/vertical-scroll-picker-props.type'

const props = withDefaults(defineProps<IVerticalScrollPickerProps>(), {
  maxVisible: 5,
  itemHeight: 40,
  optionKey: 'id',
  optionLabel: 'label',
})
defineEmits<{
  (e: 'update:modelValue', val: any): void
}>()

// Data
const internalValue = ref(props.modelValue)
const model = useVModel(props, 'modelValue')
const options = toRef(props, 'options', [...Array(11).keys()])
const initialIdx = options.value.findIndex(opt => opt === internalValue.value)
const selectedIdx = ref(initialIdx > -1 ? initialIdx : 0)
const optionsExtended = ref<any[]>([])

function getOptions() {
  if (options.value.length <= props.maxVisible) {
    optionsExtended.value = options.value

    return
  }

  const iterations = Math.ceil(5000 / options.value.length)
  const opts: any[] = []
  for (let i = 0; i < iterations; i++) {
    opts.push(options.value)
  }

  optionsExtended.value = opts.flat()
}

getOptions()

// Layout
const lastClickY = ref(0)
const isInitialized = ref(false)
const hasSmoothScroll = ref(false)
const isScrolling = ref(false)
const scrollPicker = ref<HTMLDivElement>()
const itemHeight = toRef(props, 'itemHeight')

const overscan = computedEager(() => Math.floor(props.maxVisible / 2))

const containerStyle = computedEager<CSSProperties>(() => {
  return {
    maxHeight: `${Math.min(
      props.maxVisible * itemHeight.value,
      options.value.length * itemHeight.value,
    )}px`,
  }
})

function handlePointerDown(ev: PointerEvent) {
  lastClickY.value = ev.y
  preventNextScrollRef.value = false
}

function handleMousedown() {
  document.documentElement.classList.add('cursor-grabbing')

  window.addEventListener('mousemove', handleMousemove)
  window.addEventListener('mouseup', handleMouseup)
}

function handleMousemove(ev: MouseEvent) {
  const { movementY } = ev

  hasSmoothScroll.value = false
  containerProps.ref.value!.scrollTop -= movementY
}

function handleMouseup() {
  document.documentElement.classList.remove('cursor-grabbing')
  hasSmoothScroll.value = true

  window.removeEventListener('mousemove', handleMousemove)
  window.removeEventListener('mouseup', handleMouseup)
}

function handleClick(ev: PointerEvent, idx: number) {
  if (ev.y === lastClickY.value) {
    hasSmoothScroll.value = true
    scrollTo(idx)
  }
}

// Virtual list
const preventNextScrollRef = autoResetRef(false, 1000)
const { list, containerProps, wrapperProps, scrollTo } = useVirtualList(
  optionsExtended,
  { itemHeight: itemHeight.value, overscan: overscan.value + 1 },
)

useScroll(containerProps.ref, {
  onScroll: () => {
    isScrolling.value = true
    stop()

    if (preventNextScrollRef.value) {
      return
    }

    adjustScrollDebounced()
    throttledUpdateModelValue(
      optionsExtended.value[
        Math.round(containerProps.ref.value!.scrollTop / itemHeight.value)
        + overscan.value
      ],
    )

    if (optionsExtended.value.length !== options.value.length) {
      const container = containerProps.ref.value

      const addBottom
        = container!.scrollHeight - container!.scrollTop
        <= (props.maxVisible + overscan.value) * itemHeight.value
      if (addBottom) {
        optionsExtended.value.push(...options.value)
      }

      const diffTop = container!.scrollTop - overscan.value * itemHeight.value
      if (diffTop <= 0) {
        hasSmoothScroll.value = false
        optionsExtended.value.unshift(...options.value)
        nextTick(() => {
          container!.scrollTop
            += options.value.length * itemHeight.value + Math.abs(diffTop)
          hasSmoothScroll.value = true
        })
      }
    }
  },
  onStop: () => {
    if (preventNextScrollRef.value) {
      return
    }

    isScrolling.value = false
    hasSmoothScroll.value = true
    adjustScrollDebounced()
  },
  idle: 500,
})

const adjustScrollDebounced = useDebounceFn(() => {
  if (!scrollPicker.value) {
    return
  }

  if (isScrolling.value) {
    adjustScrollDebounced()

    return
  }

  selectedIdx.value = Math.round(
    containerProps.ref.value!.scrollTop / itemHeight.value,
  )
  scrollTo(selectedIdx.value)

  start()
}, 500)

// Helpers
function reinitializeScroller(preselectIdx?: number) {
  hasSmoothScroll.value = false
  getOptions()
  const iterations = Math.round(Math.ceil(5000 / options.value.length) / 2)
  const idx
    = iterations * options.value.length
    + options.value.length
    + ((preselectIdx ?? selectedIdx.value) % options.value.length)
    + (isInitialized.value ? 0 : -2)

  nextTick(() => {
    scrollTo(idx)
    hasSmoothScroll.value = true
  })
}

const { start, stop } = useTimeoutFn(() => reinitializeScroller(), 350)

const throttledUpdateModelValue = useThrottleFn(
  (value: any) => {
    internalValue.value = value
    model.value = value
  },
  100,
  true,
  true,
)

onMounted(() => {
  reinitializeScroller()
  isInitialized.value = true
  preventNextScrollRef.value = true
})

defineExpose({
  sync: () => {
    nextTick(() => {
      const idx = options.value.findIndex(opt => opt === model.value)

      if (idx > -1) {
        preventNextScrollRef.value = true
        reinitializeScroller(idx - 2)
      }
    })
  },
})
</script>

<template>
  <div
    ref="scrollPicker"
    flex="~ col"
  >
    <!-- Header -->
    <slot name="header">
      <div
        v-if="title"
        flex="~"
        h="8"
        items-center
      >
        <h6
          flex="1"
          text="center"
          p="r-2"
          truncate
        >
          <span>
            {{ title }}
          </span>
        </h6>
      </div>
    </slot>

    <div
      flex="~ 1 col"
      relative
      overflow="auto"
      :style="containerStyle"
      rounded="custom"
      border="ca 1"
    >
      <div
        v-bind="containerProps"
        style="height: 100%"
        hide-scrollbar
        select="none"
        :class="{
          'scroll-smooth': hasSmoothScroll,
          'cursor-grab': !isScrolling,
        }"
        @mousedown="handleMousedown"
      >
        <div v-bind="wrapperProps">
          <div
            v-for="item in list"
            :key="item.index"
            :style="{ height: `${itemHeight}px` }"
            flex="~ center"
            transition="transform duration-150"
            @pointerdown="handlePointerDown"
            @pointerup="handleClick($event, item.index - 2)"
          >
            {{ item.data }}
          </div>
        </div>
      </div>

      <!-- Indicator -->
      <div
        w="full"
        absolute
        top="50%"
        transform="translate-y--50%"
        pointer-events="none"
        border="y-2 ca"
        :style="{ height: `${itemHeight}px` }"
      />

      <!-- Darkened area - Top side -->
      <div
        top="0"
        w="full"
        absolute
        pointer-events="none"
        bg="white/80 dark:darker/80"
        :style="{ height: `calc(50% - ${itemHeight / 2}px)` }"
        rounded="t-2"
      />

      <!-- Darkened area - Bottom side -->
      <div
        bottom="0"
        w="full"
        absolute
        pointer-events="none"
        bg="white/80 dark:darker/80"
        :style="{ height: `calc(50% - ${itemHeight / 2}px)` }"
        rounded="b-2"
      />
    </div>
  </div>
</template>
