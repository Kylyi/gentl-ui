<script setup lang="ts">
type IProps = {
  delay?: number
  strokeColor?: string
}

withDefaults(defineProps<IProps>(), {
  strokeColor: 'stroke-negative',
})
</script>

<template>
  <div
    w="20"
    h="20"
  >
    <svg
      class="animated-x"
      viewBox="0 0 24 24"
    >
      <path
        d="M6 6L18 18"
        fill="none"
        :style="{ animationDelay: `${delay || 0}ms` }"
        :class="strokeColor"
      />
      <path
        d="M18 6L6 18"
        fill="none"
        :style="{ animationDelay: `${delay || 0}ms` }"
        :class="strokeColor"
      />
    </svg>
  </div>
</template>

<style lang="scss" scoped>
.animated-x {
  @apply fit;
}

.animated-x path {
  @apply fill-none stroke-3;

  stroke-dasharray: 17;
  stroke-dashoffset: 17;
  animation: draw 0.35s linear forwards;
  stroke-linecap: round;
  stroke-linejoin: round;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
