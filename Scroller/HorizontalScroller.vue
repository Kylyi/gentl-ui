<script setup lang="ts">
// TYPES
import type { IScrollerProps } from '~/components/Scroller/types/scroller-props.type'

const props = withDefaults(defineProps<IScrollerProps>(), {
  arrows: 'inside',
})

const emits = defineEmits<{
  (e: 'resized'): void
  (e: 'scrolled', x: number): void
}>()

// UTILS
const { onOverflow } = useOverflow()

const scrollEl = ref<HTMLDivElement>()
const isLocalScroll = refAutoReset(false, 100)
const hasArrows = ref(false)
const { arrivedState, x } = useScroll(scrollEl)

useResizeObserver(scrollEl, () => emits('resized'))

const btnScrollSpeed = ref(4)
const clampedScrollSpeed = useClamp(btnScrollSpeed, -16, 16)

function handleScrollViaBtn(increment: boolean) {
  btnScrollSpeed.value = increment ? 4 : -4
  resume()

  window.addEventListener('pointerup', stopScrolling)
}

function stopScrolling() {
  pause()
  window.removeEventListener('pointerup', stopScrolling)
}

const updateArrows = onOverflow(
  scrollEl,
  diff => {
    if (props.arrows === 'outside') {
      if (hasArrows.value) {
        typeof diff === 'object' && (hasArrows.value = diff.xDiff! > 48)
      } else {
        typeof diff === 'object' && (hasArrows.value = diff.xDiff! > 0)
      }
    } else {
      arrivedState.left = scrollEl.value!.scrollLeft === 0
      arrivedState.right =
        scrollEl.value!.scrollLeft ===
        scrollEl.value!.scrollWidth - scrollEl.value!.clientWidth

      typeof diff === 'object' && (hasArrows.value = diff.xDiff! > 0)
    }
  },
  { direction: 'horizontal', returnDiff: true }
)

const { pause, resume } = useIntervalFn(
  () => {
    isLocalScroll.value = true
    handleScroll(clampedScrollSpeed.value)

    btnScrollSpeed.value = btnScrollSpeed.value * 1.02
  },
  5,
  { immediate: false }
)

function handleWheel(ev: WheelEvent) {
  if (ev.deltaX) {
    return
  }

  isLocalScroll.value = true
  const scrollSpeed = 25

  // Scrolling right
  if (ev.deltaY > 0 && !arrivedState.right) {
    handleScroll(scrollSpeed)
    ev.stopPropagation()
    ev.preventDefault()
  }

  // Scrolling left
  else if (ev.deltaY < 0 && !arrivedState.left) {
    handleScroll(-1 * scrollSpeed)
    ev.stopPropagation()
    ev.preventDefault()
  }
}

function handleScroll(distance: number) {
  scrollEl.value?.scrollBy({ left: distance, behavior: 'auto' })
}

watch(x, x => emits('scrolled', x))

onMounted(() => {
  useEventListener(scrollEl, 'wheel', handleWheel)
})

defineExpose({
  updateArrows,
  scroll: (left: number) => {
    if (!isLocalScroll.value) {
      x.value = left
    }
  },
  getScrollDimensions: () => ({
    width: scrollEl.value?.scrollWidth || 0,
    height: scrollEl.value?.scrollHeight || 0,
  }),
})
</script>

<template>
  <div
    class="scroller-horizontal"
    :class="[
      arrows === 'inside' ? 'arrows-inside' : 'arrows-outside',
      { 'is-overflown': hasArrows },
    ]"
  >
    <!-- LEFT ARROW -->
    <div
      v-if="hasArrows"
      class="arrow arrow--left"
      :class="{ 'is-active': !arrivedState.left }"
    >
      <Btn
        name="scroll-left"
        size="xs"
        self-center
        no-dim
        no-hover-effect
        icon="i-majesticons:chevron-left"
        @pointerdown.stop.prevent="handleScrollViaBtn(false)"
      />
    </div>

    <div
      ref="scrollEl"
      hide-scrollbar
      class="content"
      :class="contentClass"
    >
      <slot />
    </div>

    <!-- RIGHT ARROW -->
    <div
      v-if="hasArrows"
      class="arrow arrow--right"
      :class="{ 'is-active': !arrivedState.right }"
    >
      <Btn
        name="scroll-right"
        size="xs"
        self-center
        no-dim
        no-hover-effect
        icon="i-majesticons:chevron-right"
        @pointerdown.stop.prevent="handleScrollViaBtn(true)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.scroller-horizontal {
  --apply: flex relative overflow-hidden;
}

.content {
  --apply: flex flex-1 overflow-auto;
}

.arrow {
  --apply: color-ca dark:hover:color-white hover:color-black;
}

.arrows-inside {
  .arrow {
    --apply: absolute w-8 h-full max-h-20 flex z-5 pointer-events-none top-1/2 translate-y--1/2;

    .btn {
      --apply: opacity-20 pointer-events-auto;
    }

    &:not(.is-active) {
      .btn {
        --apply: opacity-0 pointer-events-none;
      }
    }

    &.is-active {

      &.arrow--left {
        background: linear-gradient(to right, rgba(64, 64, 64, 0.2) 0%, rgba(64, 64, 64, 0.2) 8px, transparent);
      }

      &.arrow--right {
        background: linear-gradient(to left, rgba(64, 64, 64, 0.2) 0%, rgba(64, 64, 64, 0.2) 8px, transparent);
      }

      > .btn {
        --apply: opacity-85 hover:bg-white dark:hover:bg-black/50;
      }
    }

    &--right {
      --apply: right-0 justify-end;
    }

    &--left {
      --apply: left-0 justify-start;
    }
  }
}

.dark {
  .arrows-inside {
    .is-active.arrow {
      &--left {
        background: linear-gradient(to right, rgba(64, 64, 64, 0.6) 0%, rgba(64, 64, 64, 0.6) 8px, transparent);
      }

      &--right {
        background: linear-gradient(to left, rgba(64, 64, 64, 0.6) 0%, rgba(64, 64, 64, 0.6) 8px, transparent);
      }
    }
  }
}

.arrows-outside {
  --apply: gap-x-1;

  .arrow {
    --apply: relative;
  }

  .arrow:not(.is-active) {
    > .btn {
      --apply: opacity-15 pointer-events-none;
    }
  }
}
</style>
