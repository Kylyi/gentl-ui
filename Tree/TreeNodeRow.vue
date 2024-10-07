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

// Functions
import { useTreeDragAndDropItem } from '~/components/Tree/functions/useTreeDragAndDropItem'

// Store
import { useTreeStore } from '~/components/Tree/tree.store'

const props = defineProps<ITreeNodeRowProps>()

// Injections
const collapsed = injectStrict(treeCollapsedKey, ref({}) as Ref<IItem>)

const handleCollapse = injectStrict(
  treeHandleCollapseKey,
  async (_node: ITreeNode) => {},
)

// Store
const { dndOptions } = storeToRefs(useTreeStore())

// Utils
const {
  draggableEl,
  handleMouseDown,
  handleTouchStart,
} = useTreeDragAndDropItem(props.node)

// Layout
const isLoading = ref(false)

const icon = computed(() => {
  const defaultClass = 'i-majesticons:chevron-right w-5 h-5 transition-transform'

  return collapsed.value[props.node.id]
    ? defaultClass
    : `${defaultClass} rotate-90`
})

const isCollapseVisible = computed(() => {
  const hasChildren = props.hasChildren?.(props.node) ?? props.node.hasChildren

  return (
    (!!props.node.children?.length || hasChildren)
    && props.level < (props.maxLevel ?? Number.POSITIVE_INFINITY)
  )
})

async function handleCollapseInternal(node: ITreeNode) {
  if (props.level >= (props.maxLevel || Number.POSITIVE_INFINITY)) {
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
</script>

<template>
  <li
    ref="draggableEl"
    class="tree-node-item"
    :data-node-id="node.id"
    :data-path="path"
    :class="{
      'has-children': isCollapseVisible,
      'has-visible-children': isCollapseVisible && !collapsed[node.id],
    }"
    :style="{ '--level': level }"
    @mousedown="handleMouseDown"
    @touchstart="handleTouchStart"
  >
    <div class="tree-node-item__wrapper">
      <!-- Move handler -->
      <TreeMoveHandler v-if="dndOptions.enabled && dndOptions.dragClass === 'tree-move-handler'" />

      <div flex="~ col">
        <!-- Collapse -->
        <Btn
          v-if="!preferCollapseBtnHidden || isCollapseVisible"
          class="btn-collapser"
          :class="[
            isCollapseVisible ? 'visible' : 'invisible',
          ]"
          size="auto"
          :loading="isLoading"
          :icon
          @click="handleCollapseInternal(node)"
        />

        <div
          v-else
          m="l-5"
          h="6"
        />

        <slot
          name="node-collapse-below"
          :node
          :level
          :path
        />
      </div>

      <!-- Content -->
      <slot
        name="node"
        :node
        :level
        :path
      >
        <span>{{ node.name }}</span>
      </slot>
    </div>

    <TreeNode
      v-if="node.children && !collapsed[node.id]"
      :nodes="node.children"
      :level="level + 1"
      :path
      :max-level
      :fetch-children
      :has-children
      :prefer-collapse-btn-hidden
      :class="[{ 'm-l-4': level && isCollapseVisible }]"
    >
      <template #node="deepNode">
        <slot
          name="node"
          :node="deepNode.node"
          :level="deepNode.level"
          :path="deepNode.path"
        />
      </template>

      <template #node-collapse-below="deepNode">
        <slot
          name="node-collapse-below"
          :node="deepNode.node"
          :level="deepNode.level"
          :path="deepNode.path"
        />
      </template>
    </TreeNode>
  </li>
</template>

<style lang="scss" scoped>
.tree-node-item {
  @apply relative list-none;

  &::before {
    @apply content-empty absolute left--2 top-0 h-full w-px
    bg-true-gray-300 dark:bg-true-gray-700;

    // @apply bg-pink;
  }

  &__wrapper {
    @apply relative flex items-start rounded-3 p-y-1;

    &::after {
      @apply content-empty absolute top-4 w-1.5 left--2 translate-y--1/2 h-px
      bg-true-gray-300 dark:bg-true-gray-700;

      // @apply bg-green;
    }
  }

  &.is-focused > .tree-node-item__wrapper {
    @apply shadow-secondary;

    box-shadow: inset 0px 0px 0px 2px var(--un-shadow-color);
  }
}

.btn-collapser {
  @apply h-6 w-6 z-1 focus-visible:outline-none;
}

.tree-node-item.has-visible-children {
  > .tree-node-item__wrapper::before {
    @apply content-empty absolute top-7 w-px left-2
    bg-true-gray-300 dark:bg-true-gray-700;

    // @apply bg-blue;
    height: calc(100% - 1.75rem);
  }
}
</style>
