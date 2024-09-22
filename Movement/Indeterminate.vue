<script setup lang="ts">
type IProps = {
  delay?: number
  strokeColor?: string
}

withDefaults(defineProps<IProps>(), {
  strokeColor: 'stroke-positive',
})
</script>

<template>
  <div
    w="20"
    h="20"
  >
    <svg
      class="animated-indeterminate"
      viewBox="0 0 24 24"
    >
      <path
        d="M 19 13 H 5 V 11 H 19 V 13 Z"
        :class="strokeColor"
        :style="{ animationDelay: `${delay || 0}ms` }"
      />
    </svg>
  </div>
</template>

<style lang="scss" scoped>
.animated-indeterminate {
  @apply fit;
}

.animated-indeterminate path {
  @apply fill-none stroke-2 origin-center;

  animation: rotate 0.35s ease-out;

  stroke-linecap: round;
  stroke-linejoin: round;
}

@keyframes rotate {
  from {
    transform: rotate(-90deg);
    opacity: 0;
  }

  to {
    transform: rotate(0deg);
    opacity: 1;
  }
}
</style>
