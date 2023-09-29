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
  --apply: flex border-true-gray/40;

  &-horizontal {
    --apply: w-full border-b-1;

    line-height: 0;

    &.separator--spaced {
      --apply: m-b-.5 p-b-.5;
    }

    &.separator--inset {
      --apply: m-x-2 w-[calc(100%-1rem)];
    }
  }

  &-vertical {
    --apply: border-r-1;

    &.separator--spaced {
      --apply: p-r-.5 m-r-.5;
    }

    &.separator--inset {
      --apply: m-y-1;
    }
  }
}
</style>
