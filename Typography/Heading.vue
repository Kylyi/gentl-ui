<script setup lang="ts">
// Types
import type { IHeadingProps } from '~/components/Typography/types/heading-props.type'

withDefaults(defineProps<IHeadingProps>(), {
  highlighted: true,
})
</script>

<template>
  <h6
    class="heading"
    min-h="12"
    :class="[{ 'is-filled': filled }, { 'is-highlighted': highlighted }]"
  >
    <slot />
  </h6>
</template>

<style lang="scss" scoped>
.heading {
  --apply: flex items-center p-x-2 rounded-custom relative;
}

.heading.is-highlighted {
  &::before {
    --apply: bottom-0 w-9/10 h-1 left-0 bg-primary content-empty absolute
      rounded-full;

    --apply: bg-gradient-to-r from-primary to-true-gray-100;
  }
}

.dark .heading {
  &::before {
    --apply: to-true-gray-800;
  }
}

.section .heading {
  --apply: p-x-0;
}

.heading.is-filled {
  --apply: p-x-4;
  --apply: bg-$Heading-bg;

  &::before {
    content: unset;
  }
}
</style>
