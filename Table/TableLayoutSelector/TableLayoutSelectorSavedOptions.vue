<script setup lang="ts">
// Types
import type { ITableLayout } from '~/components/Table/types/table-layout.type'

type IProps = {
  layout: ITableLayout
}

const props = defineProps<IProps>()

const layoutInfo = computed(() => {
  const schemaSplit = props.layout.schema.split('&')

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
    flex="~ col gap-0.5 center shrink-0"
    color="blue-100"
    p="r-1"
  >
    <!-- What was saved -->
    <div flex="~ gap-0.5">
      <div
        class="layout-info-icon tabler:columns-2"
        :class="{ 'color-primary': !layoutInfo.hasColumns }"
      />
      <div
        class="layout-info-icon ic:round-filter-alt"
        :class="{ 'color-primary': !layoutInfo.hasFilters }"
      />
      <div
        class="layout-info-icon basil:sort-outline"
        :class="{ 'color-primary': !layoutInfo.hasSorting }"
      />
    </div>

    <!-- Layout settings -->
    <div flex="~ gap-0.5">
      <div
        class="layout-info-icon ic:round-public"
        :class="{ 'color-primary': !layoutInfo.isPublic }"
      />
      <div
        class="layout-info-icon fluent:book-default-28-filled"
        :class="{ 'color-primary': !layoutInfo.isDefault }"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.layout-info-icon {
  --apply: w-4 h-4;
}
</style>
