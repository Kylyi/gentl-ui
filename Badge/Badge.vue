<script setup lang="ts">
// Types
import type { IBadgeProps } from '~/components/Badge/types/badge-props.type'

// Functions
import { getComponentProps } from '~/components/__helpers/get-config-props'

withDefaults(defineProps<IBadgeProps>(), {
  ...getComponentProps('badge'),
})
</script>

<template>
  <div
    class="badge"
    right="1"
    top="-1"
    bg="inherit"
    color="white"
    border="white"
  >
    {{ count }}
  </div>
</template>

<style lang="scss" scoped>
.badge {
  @apply absolute rounded-2 p-x-1 min-w-7 font-normal border-2 text-center
    font-rem-12;
}
</style>
