<script setup lang="ts">
// Types
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
      return 'fluent:warning-24-filled'
    case 'info':
      return 'bi:info-lg'
    case 'positive':
      return 'ep:success-filled'
    case 'negative':
      return 'octicon:x-circle-fill-24'
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

// Counter
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

// Reset timeout on notification counter change
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
    :style="{
      '--progress': `${Math.round(((TIMEOUT - counter) / TIMEOUT) * 100)}%`,
    }"
    @mouseenter="!noClose && pause()"
    @mouseleave="!noClose && handleResume()"
  >
    <slot name="before" />

    <!-- Title row -->
    <div
      flex="~ gap-x-2"
      w-full
      items-center
    >
      <!-- Icon -->
      <div
        class="shrink-0 self-start h-7 w-7 m-t-2"
        :class="notification.icon || icon"
      />

      <!-- Title -->
      <span
        p="y-2"
        grow
        :class="{
          'font-bold tracking-wide': notification.subtitle,
        }"
      >
        {{ notification.title }}
      </span>

      <!-- Close button -->
      <Btn
        v-if="!noClose"
        preset="CLOSE"
        class="color-red-500 self-start"
        size="sm"
        @click="handleHide"
      />
    </div>

    <!-- Subtitle -->
    <span
      v-if="notification.subtitle"
      class="notification-subtitle"
      :class="[`is-${notification.type}`]"
    >
      {{ notification.subtitle }}
    </span>

    <Component
      :is="notification.componentBelow.component"
      v-if="notification.componentBelow"
      :notification="notification"
      v-bind="notification.componentBelow?.props"
    />

    <!-- Progress -->
    <!-- <div
      v-if="TIMEOUT"
      class="progress-wrapper"
    >
      <progress
        class="notification-row--progress"
        :value="TIMEOUT - counter"
        :max="TIMEOUT"
      />
    </div> -->

    <!-- Counter -->
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
  --apply: relative bg-white dark:bg-darker relative flex flex-col rounded-custom
    flex-gap-x-2 w-100 p-4 shadow-consistent-sm shadow-ca gap-3;

  &::before {
    --apply: content-empty absolute left-0 top-0 h-full w-1 rounded-l-custom bg-current;
  }

  &::after {
    --apply: content-empty absolute right-0 top-1/2 translate-y--50% w-1 rounded-r-custom bg-current;
    --apply: h-$progress;
  }

  &.is-positive {
    --apply: color-green-500;
  }

  &.is-negative {
    --apply: color-red-500;
  }

  &.is-warning {
    --apply: color-amber-500;
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

  .progress-wrapper {
    --apply: absolute bottom-0 left--2px w-[calc(100%+4px)]
    h-[calc(100%+4px)] rounded-3 overflow-hidden pointer-events-none;
  }

  &--progress {
    --apply: left-0 bottom-0 w-full absolute h-1;
  }

  .notification-subtitle {
    --apply: tracking-wide text-sm color-black dark:color-white;
  }

  .counter {
    --apply: absolute rounded-2 -top-2 -right-4 p-x-1 min-w-7 bg-inherit
      color-inherit border-2 border-current text-center;
  }
}

progress::-moz-progress-bar {
  --apply: bg-current;
}
progress::-webkit-progress-value {
  --apply: bg-current;
}
progress {
  --apply: color-current;
}

progress::-webkit-progress-bar {
  --apply: bg-ca;
}
progress::-moz-progress-bar {
  --apply: bg-ca;
}
</style>
