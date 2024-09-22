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
      class="animated-check"
      viewBox="0 0 24 24"
    >
      <path
        d="M4.1 12.7L9 17.6 20.3 6.3"
        fill="none"
        :style="{ animationDelay: `${delay || 0}ms` }"
        :class="strokeColor"
      />
    </svg>
  </div>
</template>

<style lang="scss" scoped>
.animated-check {
  @apply fit;
}

.animated-check path {
  @apply fill-none stroke-3;

  stroke-dasharray: 23;
  stroke-dashoffset: 23;
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
