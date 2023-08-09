<script setup lang="ts">
// Types
import type { IQueryBuilderRowProps } from '~/components/QueryBuilder/types/query-builder-row-props.type'
import type { IQueryBuilderGroup } from '~/components/QueryBuilder/types/query-builder-group-props.type'

// Injections
import { qbItemsKey } from '~/components/QueryBuilder/provide/query-builder.provide'

defineProps<IQueryBuilderRowProps>()

// Injections
const items = injectStrict(qbItemsKey)

function updatePaths(parent?: IQueryBuilderGroup) {
  const _parent = parent ?? (toValue(items)[0] as IQueryBuilderGroup)

  _parent.children.forEach((child, idx) => {
    child.path = `${_parent.path}.children.${idx}`

    if ('isGroup' in child) {
      updatePaths(child)
    }
  })
}
</script>

<template>
  <QueryBuilderGroupInline
    v-if="'isGroup' in item"
    :data-path="item.path"
    :item="item"
    :level="level"
    :parent="parent"
    :is-last-child="isLastChild"
    :is-first-child="isFirstChild"
    @delete:row="updatePaths()"
  />

  <QueryBuilderItemInline
    v-else
    :data-path="item.path"
    :item="item"
    :level="level"
    :parent="parent"
    :is-last-child="isLastChild"
    :is-first-child="isFirstChild"
    @delete:row="updatePaths()"
  />
</template>
