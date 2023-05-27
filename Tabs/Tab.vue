<script setup lang="ts">
import { ITabProps } from '~~/components/Tabs/types/tab-props.type'

defineProps<ITabProps>()

const TAB_NAME = 'Tab_1'

defineOptions({
  name: TAB_NAME,
})
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
