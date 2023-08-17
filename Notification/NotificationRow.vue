<script setup lang="ts">
// TYPES
import type { INotificationRowProps } from '~/components/Notification/types/notification-row-props.type'

const props = defineProps<INotificationRowProps>()

const emits = defineEmits<{
  (e: 'hide'): void
}>()

const STEP = 25
const DEFAULT_TIMEOUT = 2500
const TIMEOUT = (props.notification.timeout ?? DEFAULT_TIMEOUT) / STEP

// LAYOUT
const notificationEl = ref<HTMLDivElement>()
const isPausedByForce = ref(false)

const icon = computed(() => {
  switch (props.notification.type) {
    case 'warning':
      return 'clarity:warning-solid'
    case 'info':
      return 'bi:info-lg'
    case 'positive':
      return 'akar-icons:circle-check-fill'
    case 'negative':
      return 'ci:error'
    default:
      return 'bi:info-lg'
  }
})

const { pause, resume, counter } = useInterval(STEP, {
  controls: true,
  immediate: !props.noClose,
  callback(count) {
    if (count >= TIMEOUT && TIMEOUT) {
      const { width } = notificationEl.value!.getBoundingClientRect()
      notificationEl.value!.style.width = `${width}px`
      handleHide()
    }
  },
})

function handleResume() {
  if (!isPausedByForce.value) {
    resume()
  }
}

function handleHide() {
  isPausedByForce.value = true

  // Makes sure the counter is over
  counter.value = TIMEOUT

  pause()
  emits('hide')
}

// COUNTER
const counterEl = ref<HTMLSpanElement>()

const { apply } = useMotion(counterEl, {
  initial: { scale: 1 },
  enter: { scale: 1 },
  bounce: {
    scale: 1.25,
    transition: {
      type: 'keyframes',
      duration: 100,
    },
  },
})

// RESET TIMEOUT ON NOTIFICATION COUNTER CHANGE
const notificationCounter = toRef(props.notification, 'counter')

watch(notificationCounter, async () => {
  counter.value = 0

  await apply('bounce')
  await apply('enter')
})
</script>

<template>
  <div
    ref="notificationEl"
    class="notification-row"
    :class="[`is-${notification.type}`]"
    @mouseenter="!noClose && pause()"
    @mouseleave="!noClose && handleResume()"
  >
    <slot name="before" />

    <!-- TITLE ROW -->
    <div
      flex="~ gap-x-2"
      w-full
      items-center
    >
      <!-- ICON -->
      <div
        shrink-0
        h="6"
        w="6"
        :class="notification.icon || icon"
      />

      <!-- TITLE -->
      <span
        p="y-2"
        grow
        :class="{
          'font-bold tracking-wide': notification.subtitle,
        }"
      >
        {{ notification.title }}
      </span>

      <!-- CLOSE BUTTON -->
      <Btn
        v-if="!noClose"
        preset="CLOSE"
        color="white"
        size="sm"
        @click="handleHide"
      />
    </div>

    <!-- SUBTITLE -->
    <span
      v-if="notification.subtitle"
      class="notification-subtitle"
      :class="[`is-${notification.type}`]"
    >
      {{ notification.subtitle }}
    </span>

    <div
      v-if="TIMEOUT"
      class="progress-wrapper"
    >
      <!-- PROGRESS -->
      <progress
        class="notification-row--progress"
        :value="TIMEOUT - counter"
        :max="TIMEOUT"
      />
    </div>

    <!-- COUNTER -->
    <span
      v-if="notificationCounter && notificationCounter > 1"
      ref="counterEl"
      class="counter"
    >
      {{ notificationCounter }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
.notification-row {
  --apply: relative flex flex-col rounded-3 border-2
    p-l-2 p-r-1 p-y-1 flex-gap-x-2 w-100;

  &.is-positive {
    --apply: bg-positive/85 hover:bg-positive color-white border-positive;
  }

  &.is-negative {
    --apply: bg-negative/85 hover:bg-negative color-white border-negative;
  }

  &.is-warning {
    --apply: bg-warning/85 hover:bg-warning color-white border-warning;
  }

  &.is-info {
    --apply: bg-info/85 hover:bg-info color-white border-info;
  }

  &.is-primary {
    --apply: bg-primary/85 hover:bg-primary color-white border-primary;
  }

  &.is-secondary {
    --apply: bg-secondary/85 hover:bg-secondary color-white border-secondary;
  }

  .progress-wrapper {
    --apply: absolute bottom--2px left--2px w-[calc(100%+4px)] h-[calc(100%+4px)]
      rounded-3 overflow-hidden pointer-events-none;
  }

  &--progress {
    --apply: left-0 bottom-0 w-full absolute h-1;
  }

  .notification-subtitle {
    --apply: bg-white rounded-custom p-2 m-r-2 m-b-1 tracking-wide text-sm;

    &.is-positive {
      --apply: color-positive;
    }

    &.is-negative {
      --apply: color-negative;
    }

    &.is-warning {
      --apply: color-warning;
    }

    &.is-info {
      --apply: color-info;
    }

    &.is-primary {
      --apply: color-primary;
    }

    &.is-secondary {
      --apply: color-secondary;
    }
  }

  .counter {
    --apply: absolute rounded-2 -top-2 -right-4 p-x-1 min-w-7
    bg-inherit color-white border-2 border-white text-center;
  }
}

progress::-moz-progress-bar { --apply: bg-white; }
progress::-webkit-progress-value { --apply: bg-white; }
progress { --apply: color-white; }

progress::-webkit-progress-bar { --apply: bg-white/30; }
progress::-moz-progress-bar { --apply: bg-white/30; }
</style>
