<script setup lang="ts">
// Types
import type { IQueryBuilderRowProps } from '~/components/QueryBuilder/types/query-builder-row-props.type'
import type { IQueryBuilderGroup } from '~/components/QueryBuilder/types/query-builder-group-props.type'

// Injections
import { qbItemsKey } from '~/components/QueryBuilder/provide/query-builder.provide'

withDefaults(defineProps<IQueryBuilderRowProps>(), {
  noAdd: undefined,
})

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
    :item="item"
    :level="level"
    :parent="parent"
    :is-last-child="isLastChild"
    :is-first-child="isFirstChild"
    :no-add="noAdd"
    :remove-fnc="removeFnc"
    :no-condition-change="noConditionChange"
    @delete:row="updatePaths()"
  />

  <QueryBuilderItemInline
    v-else
    :item="item"
    :level="level"
    :parent="parent"
    :is-last-child="isLastChild"
    :is-first-child="isFirstChild"
    :no-add="noAdd"
    :remove-fnc="removeFnc"
    @delete:row="updatePaths()"
  />
</template>
