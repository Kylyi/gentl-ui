<script setup lang="ts">
import { config } from '~/config'

// Types
import type { ITableLayout } from '~/components/Table/types/table-layout.type'

type IProps = {
  layout: ITableLayout
}

const props = defineProps<IProps>()

const layoutInfo = computed(() => {
  const schemaSplit = props.layout.schema.split('&')
  console.log('Log ~ layoutInfo ~  props.layout.schema:', props.layout.schema)

  const hasColumns = schemaSplit.some(s => s.startsWith('select='))
  const hasSorting = schemaSplit.some(s => s.startsWith('paging='))
  const hasFilters = schemaSplit.some(
    s => !s.startsWith('select=') && !s.startsWith('paging=')
  )

  const isDefault =
    props.layout.accessLevel === 1 || props.layout.accessLevel === 3
  const isPublic =
    props.layout.accessLevel === 4 || props.layout.accessLevel === 3

  return {
    hasColumns,
    hasSorting,
    hasFilters,
    isDefault,
    isPublic,
    isDefaultOrPublic: isDefault || isPublic,
  }
})
</script>

<template>
  <div
    flex="~ gap-0.5 self-start shrink-0"
    color="blue-100"
    p="r-1"
  >
    <!-- What was saved -->
    <div flex="~ gap-0.5">
      <div
        v-if="layoutInfo.hasColumns"
        class="layout-info-icon tabler:columns-2 color-blue-500"
      />
      <div
        v-if="layoutInfo.hasFilters"
        class="layout-info-icon ic:round-filter-alt color-blue-500"
      />
      <div
        v-if="layoutInfo.hasSorting"
        class="layout-info-icon basil:sort-outline color-blue-500"
      />
    </div>

    <!-- Layout settings -->
    <div flex="~ gap-0.5">
      <div
        v-if="layoutInfo.isPublic"
        class="layout-info-icon ic:round-public color-blue-500"
      />
      <div
        v-if="
          layoutInfo.isDefault && !config.table.useLocalStorageForDefaultLayout
        "
        class="layout-info-icon fluent:book-default-28-filled color-blue-500"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.layout-info-icon {
  --apply: w-4 h-4;
}
</style>
