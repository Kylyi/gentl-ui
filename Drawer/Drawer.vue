<script setup lang="ts">
// Types
import type { IDrawerProps } from '~~/components/Drawer/types/drawer-props.type'

const props = withDefaults(defineProps<IDrawerProps>(), {
  side: 'right',
  width: 480,
  breakpoint: 'md',
})

const emits = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'hide'): void
  (e: 'show'): void
  (e: 'before-hide'): void
  (e: 'before-show'): void
}>()

// Layout
const model = useVModel(props, 'modelValue', emits)

function handleAnimationStart() {
  if (props.modelValue) {
    emits('before-show')
  } else {
    emits('before-hide')
  }
}

function handleAnimationEnd() {
  if (!props.modelValue) {
    emits('hide')
  } else {
    emits('show')
  }
}
</script>

<template>
  <aside
    class="drawer-simple"
    :class="[
      `drawer-simple--${side}`,
      {
        'is-show': modelValue,
        'is-full-height': fullHeight,
        'is-absolute': absolute,
      },
    ]"
    :style="{ width: `${width}px` }"
    @animationstart="handleAnimationStart"
    @animationend="handleAnimationEnd"
  >
    <!-- Title -->
    <div
      v-if="!noTitle"
      class="drawer-simple__title"
      :class="titleClass"
    >
      <h6 class="drawer-simple__title-text">
        <span
          tracking="wide"
          color="ca"
        >
          {{ title }}
        </span>
      </h6>

      <slot name="title-right" />

      <Btn
        preset="CLOSE"
        self="center"
        @click="model = !model"
      />
    </div>

    <slot />
  </aside>
</template>

<style scoped lang="scss">
.drawer-simple {
  --apply: fixed flex flex-col flex-gap-1 top-0 opacity-0
    bg-light-200 dark:bg-dark-800 z-$zDrawer max-w-full overflow-auto h-full;

  transition: opacity ease-out 200ms, transform ease-out 200ms;

  &.is-absolute {
    --apply: absolute;
  }

  &:not(.is-full-height) {
    --apply: m-t-$navHeight;
    height: calc(100% - var(--navHeight));
  }

  &__title {
    --apply: flex shrink-0 h-$navHeight p-l-4 p-r-2 items-center border-b-1 border-ca;

    &-text {
      --apply: flex-1 text-h6 truncate grow;
    }
  }

  &--left {
    // Project specific
    --apply: -translate-x-100%;
  }

  &--right {
    --apply: right-0 translate-x-100%;

    // Project specific
    // @media screen and (min-width: 1536px) {
    //   margin-right: calc(calc(100% - var(--screen2Xl)) / 2);
    // }
  }

  &.is-show {
    --apply: translate-x-0 opacity-100;
  }
}
</style>
