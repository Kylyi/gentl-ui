<script setup lang="ts">
import { v4 as uuid } from 'uuid'
import { ITabProps } from '~~/components/Tabs/types/tab-props.type'

defineProps<ITabProps>()

const TAB_NAME = /* hoist-static */ `Tab_${uuid}`

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
