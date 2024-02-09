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
  --apply: flex relative;
}

.progress-bar__inner {
  --apply: absolute h-full;
}

.progress-bar__color {
  --apply: bg-positive mix-blend-screen w-full z-4;
}

.whitebg {
  --apply: bg-white w-full z-1;
}

.blackbg {
  --apply: bg-black z-2;
  width: calc(var(--progress) * 1%);
}

.progress-bar__text {
  --apply: absolute left-1/2 top-1/2 translate--50% mix-blend-difference
    color-white z-3 text-nowrap;
}
</style>
