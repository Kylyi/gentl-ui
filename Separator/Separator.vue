<script setup lang="ts">
// TYPES
import type { ISeparatorProps } from '~/components/Separator/types/separator-props.type'

defineProps<ISeparatorProps>()
</script>

<template>
  <span
    class="separator"
    :class="[
      vertical ? 'separator-vertical' : 'separator-horizontal',
      {
        'separator--spaced': spaced,
        'separator--inset': inset,
      },
    ]"
  >
    &#8203;
  </span>
</template>

<style lang="scss" scoped>
.separator {
  @applyflex border-true-gray/40 rounded-full;

  &-horizontal {
    @applyw-full border-b-1;

    line-height: 0;

    &.separator--spaced {
      @applym-b-.5 p-b-.5;
    }

    &.separator--inset {
      @applym-x-2 w-[calc(100%-1rem)];
    }
  }

  &-vertical {
    @applyborder-r-1;

    &.separator--spaced {
      @applyp-r-.5 m-r-.5;
    }

    &.separator--inset {
      @applym-y-1;
    }
  }
}
</style>
