<script setup lang="ts">
type IProps = {
  filled?: boolean
}

defineProps<IProps>()
</script>

<template>
  <h6
    class="heading"
    :class="{ 'is-filled': filled }"
  >
    <slot />
  </h6>
</template>

<style lang="scss" scoped>
.heading {
  --apply: flex min-h-12 items-center p-x-2 rounded-custom relative;

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
  --apply: bg-ca p-x-4;

  &::before {
    content: unset;
  }
}
</style>
