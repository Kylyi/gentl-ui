<script setup lang="ts">
const delay = ref(Math.random() * 2000)
const containerEl = ref<HTMLDivElement>()
</script>

<template>
  <div
    ref="containerEl"
    class="attention-element"
    :style="{ ['--delay']: `${delay}ms` }"
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.attention-element {
  animation: vibrate 4s linear var(--delay) infinite normal none;
}

@keyframes vibrate {
  0% {
    transform: translate(0);
  }

  10% {
    transform: translate(-2px, -2px);
  }

  20% {
    transform: translate(2px, -2px);
  }

  30% {
    transform: translate(-2px, 2px);
  }

  40% {
    transform: translate(2px, 2px);
  }

  50% {
    transform: translate(-2px, -2px);
  }

  60% {
    transform: translate(2px, -2px);
  }

  70% {
    transform: translate(-2px, 2px);
  }

  80% {
    transform: translate(-2px, -2px);
  }

  90% {
    transform: translate(2px, -2px);
  }

  100% {
    transform: translate(0);
  }
}
</style>
