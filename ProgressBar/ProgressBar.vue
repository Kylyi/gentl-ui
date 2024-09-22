<script setup lang="ts">
type IProps = {
  progress?: number
  label: string | ((progress?: number) => string)
}

defineProps<IProps>()
</script>

<template>
  <div
    class="progress-bar"
    h="8"
    :style="{ '--progress': progress ?? 0 }"
  >
    <div class="progress-bar__inner whitebg" />
    <div class="progress-bar__inner blackbg" />
    <div class="progress-bar__inner progress-bar__color" />

    <span class="progress-bar__text">
      {{ typeof label === 'function' ? label(progress) : label }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
.progress-bar {
  @applyflex relative;
}

.progress-bar__inner {
  @applyabsolute h-full;
}

.progress-bar__color {
  @applybg-positive mix-blend-screen w-full z-4;
}

.whitebg {
  @applybg-white w-full z-1;
}

.blackbg {
  @applybg-black z-2;
  width: calc(var(--progress) * 1%);
}

.progress-bar__text {
  @applyabsolute left-1/2 top-1/2 translate--50% mix-blend-difference
    color-white z-3 text-nowrap;

  white-space: nowrap;
}
</style>
