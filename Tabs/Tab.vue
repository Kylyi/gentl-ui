<script setup lang="ts">
import { ITabProps } from '~~/components/Tabs/types/tab-props.type'

defineOptions({
  name: 'Tab1',
})

defineProps<ITabProps>()
</script>

<template>
  <div class="tab-content">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.tab-content {
  --apply: fit;
}
</style>
