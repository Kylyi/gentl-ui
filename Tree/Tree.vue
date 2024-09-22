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
} from '~/components/Tree/provide/tree.provide'

const props = withDefaults(defineProps<ITreeProps>(), {
  connectors: true,
  rowHeight: '32px',
  filterMode: 'parent',
  collapsedOnInit: true,
})

// UTILS
const { flattenTree, flatToTree, getChildren } = useTraversing()
const { searchData } = useSearching()
const { addNode, removeNode } = useTreeUtils(props)

// LAYOUT
const searchInputEl = ref<InstanceType<typeof SearchInput>>()
const treeEl = ref<HTMLDivElement>()
const nodesDomEls = ref<HTMLElement[]>()
const isInitialized = ref(false)
const search = ref('')
const level = ref(0)
const collapsedById = ref<Record<string | number, boolean>>({})
const nodesAddedViaFetch = ref<ITreeNode[]>([])

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
 * so we canuse keyboard navigation
 */
function getNodesElements(resetHoveredIdx = true) {
  if (!nodesFiltered.value || !treeEl.value) {
    nodesDomEls.value = []

    return
  }

  nodesDomEls.value = Array.from(
    treeEl.value.querySelectorAll('.tree-node-item'),
  ) as HTMLElement[]

  resetHoveredIdx && (hoveredIdx.value = -1)
}

const nodesFiltered = computedAsync(async () => {
  if (!props.nodes) {
    return []
  }

  if (!search.value && isInitialized.value) {
    return props.nodes
  }

  const nodesClone = klona(props.nodes)
  const nodesFlattened = flattenTree(nodesClone)

  // TODO: Side effect in computed!!
  if (!isInitialized.value) {
    isInitialized.value = true

    const nodesToCollapse
      = props.collapsedOnInit === 'first'
        ? nodesFlattened.slice(1)
        : props.collapsedOnInit
          ? nodesFlattened
          : []

    nodesToCollapse.forEach(node => {
      collapsedById.value[node.id] = true
    })

    if (!search.value) {
      return props.nodes
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

// KEYBOARD NAVIGATION
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

  // REMOVE FOCUS FROM PREVIOUS NODE
  if (!isNil(oldIdx) && oldIdx !== -1) {
    nodesDomEls.value[oldIdx].classList.toggle('is-focused')
  }

  // ADD FOCUS TO CURRENT NODE
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

  // NOTHIGN TO FOCUS
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

    case 'ArrowRight':
      // Expand
      ev.preventDefault()
      currentNode && (await handleCollapse(currentNode, false))

      break

    case 'ArrowLeft':
      // Collapse
      ev.preventDefault()
      currentNode && (await handleCollapse(currentNode, true))

      break

    case 'Enter':
      // Select
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

// PROVIDE
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
    return [...props.nodes, ...nodesAddedViaFetch.value].find(
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
    :style="{
      '--treeRowHeight': rowHeight,
    }"
  >
    <!-- SEARCH -->
    <div
      v-if="!noSearch"
      border="b-1 ca"
      p="x-1 b-2"
      shrink="0"
      flex="~ gap-x-2"
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
      p="l-none"
      :class="contentClass"
    >
      <TreeNode
        :nodes="nodesFiltered"
        :level="level"
        :max-level="maxLevel"
        :prefer-collapse-btn-hidden="preferCollapseBtnHidden"
        :fetch-children="fetchChildren"
        :has-children="hasChildren"
        overflow="x-auto"
      >
        <template #node="{ node, level: lvl }">
          <slot
            name="node"
            :node="node"
            :level="lvl"
            :collapse="() => handleCollapse(node)"
            :is-collapsed="collapsedById[node.id]"
          />
        </template>
      </TreeNode>
    </ScrollArea>

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
:deep(li > div) {
  height: var(--treeRowHeight);
}

:deep(.ps > ul) {
  --apply: m-0 p-0;
}

:deep(ul li) {
  --apply: list-none;
}
</style>
