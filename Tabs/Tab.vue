<script setup lang="ts">
// Types
import { type ITabProps } from '~/components/Tabs/types/tab-props.type'

defineOptions({
  // eslint-disable-next-line vue/component-definition-name-casing
  name: 'Tab_1',
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
  @applyfit;
}
</style>
