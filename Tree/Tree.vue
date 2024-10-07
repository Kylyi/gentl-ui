<script setup lang="ts">
import { klona } from 'klona/full'

// Types
import type { ITreeNode } from '~/components/Tree/types/tree-node.type'
import type { ITreeProps } from '~/components/Tree/types/tree-props.type'

// Functions
import { useSearching } from '~/libs/Shared/functions/data/useSearching'
import { useTraversing } from '~/utils/helpers/useTraversing'
import { useTreeUtils } from '~/components/Tree/functions/useTreeUtils'

// Components
import SearchInput from '~/components/Inputs/SearchInput.vue'

// Injections
import {
  treeCollapsedKey,
  treeHandleCollapseKey,
  treeIdKey,
} from '~/components/Tree/provide/tree.provide'
import { useTreeDragAndDrop } from '~/components/Tree/functions/useTreeDragAndDrop'

const props = withDefaults(defineProps<ITreeProps>(), {
  connectors: true,
  filterMode: 'parent',
  collapsedOnInit: true,
})

// Init
const uuid = useId()

provideLocal(treeIdKey, uuid)

// Utils
const { searchData } = useSearching()
const { nodes, addNode, removeNode } = useTreeUtils()
const { containerEl, draggedItem } = useTreeDragAndDrop(props)
const { flattenTree, flatToTree, getChildren } = useTraversing()

// Layout
const searchInputEl = ref<InstanceType<typeof SearchInput>>()
const treeEl = ref<HTMLDivElement>()
const nodesDomEls = ref<HTMLElement[]>()
const isInitialized = ref(false)
const search = ref('')
const level = ref(0)
const nodesAddedViaFetch = ref<ITreeNode[]>([])

function handleTreeMounted(node: any) {
  containerEl.value = node.el
}

// Expand / Collapse
const collapsedById = ref<Record<string | number, boolean>>({})

function handleExpandNode(id: string | number) {
  if (collapsedById.value[id]) {
    collapsedById.value[id] = false
  }
}

function handleCollapseNode(id: string | number) {
  if (!collapsedById.value[id]) {
    collapsedById.value[id] = true
  }
}

async function handleCollapse(node: ITreeNode, val?: boolean) {
  const { id, hasChildren, childrenLoaded } = node
  const _hasChildren = props.hasChildren?.(node) ?? hasChildren

  // Fetch children if needed
  if (!!_hasChildren && props.fetchChildren && !childrenLoaded) {
    const res = await props.fetchChildren.fnc(node.id)
    const children = res[props.fetchChildren.mapKey] as ITreeNode[]
    nodesAddedViaFetch.value = [...nodesAddedViaFetch.value, ...children]

    node.children = children
    node.childrenLoaded = true

    children.forEach(node => {
      collapsedById.value[node.id] = true
    })
  }

  // If we want to be explicit ~ collapse or expand
  if (val !== undefined) {
    val ? handleCollapseNode(id) : handleExpandNode(id)
  } else {
    collapsedById.value[id] = !collapsedById.value[id]
  }

  nextTick(() => {
    getNodesElements(false)
  })
}

/**
 * Gets all the DOM elements of the nodes
 * so we can use keyboard navigation
 */
function getNodesElements(resetHoveredIdx = true) {
  if (!nodesFiltered.value || !treeEl.value) {
    nodesDomEls.value = []

    return
  }

  nodesDomEls.value = Array.from(treeEl.value.querySelectorAll('.tree-node-item')) as HTMLElement[]

  resetHoveredIdx && (hoveredIdx.value = -1)
}

const nodesFiltered = computedAsync(async () => {
  if (!nodes.value) {
    return []
  }

  if (!search.value && isInitialized.value) {
    return nodes.value
  }

  const nodesClone = klona(nodes.value)
  const nodesFlattened = flattenTree(nodesClone)

  // TODO: Side effect in computed!!
  if (!isInitialized.value) {
    isInitialized.value = true

    const nodesToCollapse = props.collapsedOnInit === 'first'
      ? nodesFlattened.slice(1)
      : props.collapsedOnInit
        ? nodesFlattened
        : []

    nodesToCollapse.forEach(node => {
      collapsedById.value[node.id] = true
    })

    if (!search.value) {
      return nodes.value
    }
  }

  let searched = await searchData(search, nodesFlattened, {
    keys: ['name'],
    shouldSort: false,
    ...props.fuseOptions,
  })

  if (props.filterMode === 'specific') {
    // Get all IDs that match the search
    const searchedNodesId = searched.map(node => node.id)

    // We need to filter out the children nodes that are already part of some parent
    // that also matches the search -> basically, we only want to get the parent
    // This intersection will give us the IDs of the children that are already part of
    // some parent that matches the search
    const searchedNodesIdByParentId = searched.reduce((agg, node) => {
      if (node.parent?.id && searchedNodesId.includes(node.parent.id)) {
        if (agg[node.parent.id] === undefined) {
          agg[node.parent.id] = []
        }

        agg[node.parent.id].push(node.id)
      }

      return agg
    }, {} as Record<string | number, Array<string | number>>)

    const filteredIds = Object.values(searchedNodesIdByParentId).flat()

    searched = searched.filter(node => !filteredIds.includes(node.id))
  } else if (props.filterMode === 'parent') {
    const searchedChildren = getChildren(searched, nodesFlattened)
    searched = flatToTree(searchedChildren, nodesFlattened)
  }

  return searched as ITreeNode[]
})

// Keyboard navigation
const { focused: isFocused } = useFocusWithin(treeEl)
const elFocused = ref<HTMLElement>()
const hoveredIdx = ref(-1)

watch(isFocused, isFocused => {
  if (!isFocused) {
    hoveredIdx.value = -1
  }
})

watch(hoveredIdx, (idx, oldIdx) => {
  if (idx === oldIdx || !nodesDomEls.value) {
    return
  }

  // Remove focus from previous node
  if (!isNil(oldIdx) && oldIdx !== -1) {
    nodesDomEls.value[oldIdx].classList.toggle('is-focused')
  }

  // Add focus to current node
  if (!isNil(idx) && idx !== -1) {
    nodesDomEls.value[idx]?.classList.toggle('is-focused')
    elFocused.value = nodesDomEls.value[idx]

    if ('scrollIntoViewIfNeeded' in elFocused.value) {
      // FIXME: Once Firefox supports this...
      ;(elFocused.value as any)?.scrollIntoViewIfNeeded()
    } else {
      elFocused.value?.scrollIntoView()
    }
  }

  // Nothing to focus
  else {
    elFocused.value = undefined
  }
})

watch(search, () => {
  setTimeout(() => getNodesElements(), 0)
})

async function handleKey(ev: KeyboardEvent) {
  if (!isFocused.value) {
    return
  }

  const currentNodeId = elFocused.value?.getAttribute('data-node-id')
  const currentNode = [
    ...(nodesFiltered.value || []),
    ...nodesAddedViaFetch.value,
  ].find(node => String(node.id) === currentNodeId)

  switch (ev.key) {
    case 'Tab':
      ev.preventDefault()
      break

    case 'ArrowUp':
      ev.preventDefault()
      hoveredIdx.value = Math.max(0, hoveredIdx.value - 1)
      break

    case 'ArrowDown':
      ev.preventDefault()
      hoveredIdx.value = Math.min(
        nodesDomEls.value!.length - 1,
        hoveredIdx.value + 1,
      )

      break

      // Expand
    case 'ArrowRight':
      ev.preventDefault()
      currentNode && (await handleCollapse(currentNode, false))

      break

      // Collapse
    case 'ArrowLeft':
      ev.preventDefault()
      currentNode && (await handleCollapse(currentNode, true))

      break

      // Select
    case 'Enter':
      ev.preventDefault()
      ;(
        elFocused.value?.querySelector(
          'a, button:not(.btn-collapser',
        ) as HTMLElement
      )?.click()
      break

    default:
      break
  }
}

onKeyStroke(
  ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Tab'],
  handleKey,
)

// Provide
provide(treeCollapsedKey, collapsedById)
provide(treeHandleCollapseKey, handleCollapse)

onMounted(() => {
  setTimeout(() => {
    getNodesElements()
  }, 250)
})

defineExpose({
  focusSearch: () => searchInputEl.value?.focus(),
  addNode,
  removeNode,
  getNode(id: number | string) {
    return [...nodes.value, ...nodesAddedViaFetch.value].find(
      node => String(node.id) === String(id),
    )
  },
})
</script>

<template>
  <div
    ref="treeEl"
    column
    overflow="auto"
    class="tree"
    tabindex="0"
    :class="{ 'has-connectors': connectors }"
  >
    <!-- Search -->
    <div
      v-if="!noSearch"
      class="search-wrapper"
    >
      <SearchInput
        ref="searchInputEl"
        v-model="search"
        grow
        content-class="!bg-white !dark:bg-darker"
      />

      <slot name="search-append" />
    </div>

    <ScrollArea
      v-if="nodesFiltered?.length"
      flex="1"
      overflow="auto"
      :options="{ wheelSpeed: 0.25, wheelPropagation }"
      p="!l-none"
      :class="contentClass"
    >
      <TreeNode
        :nodes="nodesFiltered"
        :level
        :max-level
        :prefer-collapse-btn-hidden
        :fetch-children
        :has-children
        overflow="x-auto"
        @vue:mounted="handleTreeMounted"
      >
        <template #node="{ node, level: lvl, path }">
          <slot
            name="node"
            :node
            :level="lvl"
            :path
            :collapse="() => handleCollapse(node)"
            :is-collapsed="collapsedById[node.id]"
          />
        </template>

        <template #node-collapse-below="{ node, level: lvl, path }">
          <slot
            name="node-collapse-below"
            :node
            :level="lvl"
            :path
            :collapse="() => handleCollapse(node)"
            :is-collapsed="collapsedById[node.id]"
          />
        </template>
      </TreeNode>
    </ScrollArea>

    <!-- Drop indicator -->
    <div
      v-if="draggedItem?.dropIndicatorPos"
      class="drop-indicator"
      :style="{
        left: `${draggedItem.dropIndicatorPos.x ?? 0}px`,
        top: `${draggedItem.dropIndicatorPos.y ?? 0}px`,
        width: `${draggedItem.dropIndicatorPos.width ?? 0}px`,
      }"
    >
      <div
        class="drop-indicator__icon"
        :class="{
          'rotate-y-180 -top-3': draggedItem.dropDirection === 'below',
          'rotate-180 -top-7px': draggedItem.dropDirection === 'above',
        }"
      >
        <div i-tabler:arrow-back />
      </div>
    </div>

    <!-- No data -->
    <Banner
      v-if="!nodesFiltered?.length"
      no-dismiss
      m="t-2"
      :label="$t('general.noData')"
      icon-center
    />
  </div>
</template>

<style lang="scss" scoped>
.search-wrapper {
  @apply p-1 shrink-0 flex gap-x-2 border-b-1 border-ca;
}

.drop-indicator {
  @apply fixed h-2px bg-primary w-full rounded-full pointer-events-none z-$zMax;

  &__icon {
    @apply w-5 h-5 relative rounded-custom
    color-primary bg-white dark:bg-darker;
  }
}
</style>
