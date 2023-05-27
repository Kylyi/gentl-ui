<script setup lang="ts">
// TYPES
import type { ISkeletonProps } from '~~/components/Skeleton/types/skeleton-props.type'

withDefaults(defineProps<ISkeletonProps>(), {
  type: 'wave',
  animationSpeed: 1500,
})
</script>

<template>
  <div
    class="skeleton"
    :class="`skeleton--${type}`"
    :style="{ '--animation-speed': `${animationSpeed}ms` }"
  />
</template>

<style lang="scss" scoped>
.skeleton {
  --apply: cursor-wait bg-filled;

  &::before {
    content: '\00a0';
  }

  &--pulse {
    animation: pulse var(--animation-speed) linear 0.5s infinite;
  }

  &--wave,
  &--blink {
    --apply: relative overflow-hidden z-1;

    &::after {
      --apply: content-empty absolute inset-0 z-0;
    }
  }

  &--blink::after {
    --apply: bg-white/70;
    animation: fade var(--animation-speed) linear 0.5s infinite alternate;
  }

  &--wave::after {
    --apply: z-0;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0.75),
      rgba(255, 255, 255, 0)
    );
    animation: wave var(--animation-speed) linear 0.5s infinite;
  }
}

.dark {
  .skeleton {
    &--wave::after {
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0),
        rgba(255, 255, 255, 0.25),
        rgba(255, 255, 255, 0)
      );
    }

    &--blink::after {
      --apply: bg-white/20;
    }
  }
}

@keyframes wave {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

@keyframes fade {
  0% {
    opacity: 0;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.5;
    transform: scale(0.85);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
