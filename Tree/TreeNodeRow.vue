<script setup lang="ts">
// @ts-nocheck
// Types
import type { ITreeNodeRowProps } from '~/components/Tree/types/tree-node-row-props.type'
import type { ITreeNode } from '~/components/Tree/types/tree-node.type'

// Injections
import {
  treeCollapsedKey,
  treeHandleCollapseKey,
} from '~/components/Tree/provide/tree.provide'

const props = defineProps<ITreeNodeRowProps>()

// LAYOUT
const isLoading = ref(false)

const isCollapseVisible = computedEager(() => {
  const hasChildren = props.hasChildren?.(props.node) ?? props.node.hasChildren

  return (
    (!!props.node.children?.length || hasChildren) &&
    props.level < (props.maxLevel ?? Infinity)
  )
})

async function handleCollapseInternal(node: ITreeNode) {
  if (props.level >= (props.maxLevel || Infinity)) {
    return
  }

  isLoading.value = true

  try {
    await handleCollapse(node)
    isLoading.value = false
  } catch (error) {
    console.error(error)
    isLoading.value = false
  }
}

// INJECT
const collapsedRef = injectStrict(treeCollapsedKey, ref({}))

const handleCollapse = injectStrict(
  treeHandleCollapseKey,
  async (_node: ITreeNode) => {}
)
</script>

<template>
  <li
    class="tree-node-item"
    :data-node-id="node.id"
    :class="{ 'has-children': isCollapseVisible }"
  >
    <div class="tree-node-item--wrapper">
      <Btn
        v-if="!preferCollapseBtnHidden"
        class="btn-collapser"
        :class="[
          isCollapseVisible ? 'visible' : 'invisible',
          { 'm-l-4 m-r-1': level && isCollapseVisible },
        ]"
        size="auto"
        w="6"
        h="6"
        z="1"
        focus-visible="outline-none"
        :loading="isLoading"
        :icon="
          collapsedRef[node.id]
            ? 'majesticons:chevron-right w-5 h-5 transition-transform'
            : 'majesticons:chevron-right w-5 h-5 rotate-90 transition-transform'
        "
        @click="handleCollapseInternal(node)"
      />

      <slot
        name="node"
        :node="node"
        :level="level"
      >
        <span>{{ node.name }}</span>
      </slot>
    </div>

    <TreeNode
      v-if="node.children && !collapsedRef[node.id]"
      :nodes="node.children"
      :level="level + 1"
      :max-level="maxLevel"
      :fetch-children="fetchChildren"
      :has-children="hasChildren"
      :class="[{ 'm-l-4': level && isCollapseVisible }]"
      :prefer-collapse-btn-hidden="preferCollapseBtnHidden"
    >
      <template #node="deepNode">
        <slot
          name="node"
          :node="deepNode.node"
          :level="deepNode.level"
        />
      </template>
    </TreeNode>
  </li>
</template>

<style lang="scss" scoped>
.tree-node-item {
  &--wrapper {
    --apply: flex items-center rounded-3;
  }

  &.is-focused > .tree-node-item--wrapper {
    --apply: shadow-secondary;

    box-shadow: inset 0px 0px 0px 2px var(--un-shadow-color);
  }
}
</style>
