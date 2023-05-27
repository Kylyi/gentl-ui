<script setup lang="ts">
// TYPES
import type { IScrollerProps } from '~~/components/Scroller/types/scroller-props.type'

const props = withDefaults(defineProps<IScrollerProps>(), {
  arrows: 'inside',
})

const emits = defineEmits<{
  (e: 'resized'): void
}>()

// UTILS
const { onOverflow } = useOverflow()

const scrollEl = ref<HTMLDivElement>()
const hasArrows = ref(false)
const { arrivedState } = useScroll(scrollEl, {
  onScroll: () => emits('resized'),
})

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
        typeof diff === 'object' && (hasArrows.value = diff.yDiff! > 48)
      } else {
        typeof diff === 'object' && (hasArrows.value = diff.yDiff! > 0)
      }
    } else {
      arrivedState.top = scrollEl.value!.scrollTop === 0
      arrivedState.bottom =
        scrollEl.value!.scrollTop ===
        scrollEl.value!.scrollHeight - scrollEl.value!.clientHeight

      typeof diff === 'object' && (hasArrows.value = diff.yDiff! > 0)
    }
  },
  { direction: 'vertical', returnDiff: true }
)

const { pause, resume } = useIntervalFn(
  () => {
    handleScroll(clampedScrollSpeed.value)

    btnScrollSpeed.value = btnScrollSpeed.value * 1.02
  },
  5,
  { immediate: false }
)

function handleWheel(ev: WheelEvent) {
  const scrollSpeed = 25

  // SCROLLING RIGHT
  if (ev.deltaY > 0 && !arrivedState.bottom) {
    handleScroll(scrollSpeed)
    ev.stopPropagation()
    ev.preventDefault()
  }

  // SCROLLING LEFT
  else if (ev.deltaY < 0 && !arrivedState.top) {
    handleScroll(-1 * scrollSpeed)
    ev.stopPropagation()
    ev.preventDefault()
  }
}

function handleScroll(distance: number) {
  scrollEl.value?.scrollBy({ top: distance, behavior: 'auto' })
}

onMounted(() => {
  useEventListener(scrollEl, 'wheel', handleWheel)
})

defineExpose({
  updateArrows,
  getScrollDimensions: () => ({
    width: scrollEl.value?.scrollWidth || 0,
    height: scrollEl.value?.scrollHeight || 0,
  }),
})
</script>

<template>
  <div
    class="scroller-vertical"
    :class="[arrows === 'inside' ? 'arrows-inside' : 'arrows-outside']"
  >
    <!-- TOP ARROW -->
    <div
      v-if="hasArrows"
      class="arrow arrow--top"
      :class="{ 'is-active': !arrivedState.top }"
    >
      <Btn
        name="scroll-top"
        size="xs"
        self-center
        no-dim
        no-hover-effect
        icon="majesticons:chevron-up"
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

    <!-- BOTTOM ARROW -->
    <div
      v-if="hasArrows"
      class="arrow arrow--bottom"
      :class="{ 'is-active': !arrivedState.bottom }"
    >
      <Btn
        name="scroll-bottom"
        size="xs"
        self-center
        no-dim
        no-hover-effect
        icon="majesticons:chevron-down"
        @pointerdown.stop.prevent="handleScrollViaBtn(true)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.scroller-vertical {
  --apply: flex flex-col relative items-center overflow-hidden;
}

.content {
  --apply: flex flex-col flex-1 overflow-auto w-full;
}

.arrow {
  --apply: color-ca dark:hover:color-white hover:color-black;
}

.arrows-inside {
  .arrow {
    --apply: absolute w-16 w-full flex z-5 pointer-events-none;

    .btn {
      --apply: opacity-20 pointer-events-auto;
    }

    &:not(.is-active) {
      .btn {
        --apply: opacity-0 pointer-events-none;
      }
    }

    &.is-active {

      &.arrow--top {
        background:
          linear-gradient(to bottom, theme('colors.truegray.200') 0%, theme('colors.truegray.200') 16px, transparent);
      }

      &.arrow--bottom {
        background:
          linear-gradient(to top, theme('colors.truegray.200') 0%, theme('colors.truegray.200') 16px, transparent);
      }

      > .btn {
        --apply: opacity-85 hover:bg-white dark:hover:bg-black/50;
      }
    }

    &--bottom {
      --apply: bottom-0 justify-center;
    }

    &--top {
      --apply: top-0 justify-center;
    }
  }
}

.dark {
  .arrows-inside {
    .is-active.arrow {
      &--top {
        background: linear-gradient(to bottom, theme('colors.truegray.800') 0%, theme('colors.truegray.800') 16px, transparent);
      }

      &--bottom {
        background: linear-gradient(to top, theme('colors.truegray.800') 0%, theme('colors.truegray.800') 16px, transparent);
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
