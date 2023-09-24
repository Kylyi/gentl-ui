<script setup lang="ts">
defineProps<{ modelValue: boolean }>()

defineEmits<{
  (e: 'update:model-value', val: boolean): void
}>()
</script>

<template>
  <button
    name="menu"
    class="burger-wrapper"
    no-box-shadow
    @click="$emit('update:model-value', !modelValue)"
  >
    <div
      class="burger"
      :class="{ 'is-open': modelValue }"
    >
      <span />
      <span />
      <span />
      <span />
    </div>
  </button>
</template>

<style lang="scss" scoped>
.burger {
  --apply: rotate-0 transition-all ease-in-out duration-500 cursor-pointer
    relative w-9 h-9;

  &-wrapper {
    --apply: p-0 self-center rounded-2 w-10 h-10 flex flex-center
      hover:bg-true-gray/20;
  }

  span {
    --apply: block absolute h-4px w-7 rotate-0 rounded-full opacity-100
      bg-current transition-all ease-in-out duration-250 left-1;

    &:nth-child(1) {
      --apply: top-1.7;
    }

    &:nth-child(2),
    &:nth-child(3) {
      --apply: top-1/2 translate-y--1/2;
    }

    &:nth-child(4) {
      --apply: bottom-1.7;
    }
  }

  &.is-open {
    span {
      &:nth-child(1) {
        --apply: top-4 w-0 left-1/2;
      }

      &:nth-child(2) {
        --apply: rotate-45;
      }

      &:nth-child(3) {
        --apply: rotate--45;
      }

      &:nth-child(4) {
        --apply: bottom-1/2 translate-y-1/2 w-0 left-1/2;
      }
    }
  }
}
</style>
