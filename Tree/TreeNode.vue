<script setup lang="ts">
// @ts-nocheck
// TYPES
import type { ITreeNodeProps } from '~/components/Tree/types/tree-node-props.type'

defineProps<ITreeNodeProps>()
</script>

<template>
  <ul
    class="tree-node"
    :class="{ 'is-root': !level }"
    relative
  >
    <TreeNodeRow
      v-for="node in nodes"
      :key="node.id"
      :node="node"
      :level="level"
      :max-level="maxLevel"
      :fetch-children="fetchChildren"
      :has-children="hasChildren"
      :prefer-collapse-btn-hidden="preferCollapseBtnHidden"
    >
      <template #node="deepNode">
        <slot
          name="node"
          :node="deepNode.node"
          :level="deepNode.level"
        />
      </template>
    </TreeNodeRow>
  </ul>
</template>

<style lang="scss" scoped>
.tree-node {
  @apply relative;

  &:not(.is-root) {
    @apply p-l-2.5;
  }
}

.tree.has-connectors {
  .tree-node:not(.is-root) {
    .tree-node-item {
      @apply relative;

      &::after {
        @apply content-empty absolute top-0 left-0 h-full w-1px
          bg-true-gray-200 dark:bg-true-gray-700;
      }

      &:last-child::after {
        @apply h-1/2;
      }

      &.has-children::before {
        @apply w-8px;
      }

      :deep(.tree-node-item--wrapper) {
        &::before {
          @apply content-empty absolute left-0 w-4 h-1px
          bg-true-gray-200 dark:bg-true-gray-700;
        }
      }
    }
  }
}
</style>
