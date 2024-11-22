// Types
import type { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'
import type { IQueryBuilderDraggedItem } from '~/components/QueryBuilder/types/query-builder-dragged-item.type'

// Injections
import { queryBuilderIdKey } from '~/components/QueryBuilder/provide/query-builder.provide'

// Models
import type { TableColumn } from '~/components/Table/models/table-column.model'

export function useQueryBuilderStore(queryBuilderId?: string) {
  const _queryBuilderId = injectLocal(queryBuilderIdKey, queryBuilderId ?? useId())

  return defineStore(`queryBuilder.${_queryBuilderId}`, () => {
    // Data
    const columns = ref<TableColumn<any>[]>([])
    const items = ref<IQueryBuilderRow[]>([])
    const draggedItem = ref<IQueryBuilderDraggedItem | undefined>()
    const collapsedById = ref<Record<string | number, boolean>>({})

    // Layout
    const maxNestingLevel = ref(0)
    const isSmallerScreen = ref(false)
    const isActivelyModifyingValues = ref(false)
    const queryBuilderEl = ref<HTMLElement>()
    const hoveredItem = ref<IQueryBuilderRow | undefined>()

    const queryBuilderElRect = ref<DOMRect>()

    useResizeObserver(queryBuilderEl, entries => {
      requestAnimationFrame(() => {
        const { contentRect } = entries[0]

        isSmallerScreen.value = contentRect.width < 1024
        queryBuilderElRect.value = queryBuilderEl.value?.getBoundingClientRect()
      })
    })

    return {
      // Data
      columns,
      items,
      draggedItem,
      collapsedById,

      // Layout
      queryBuilderEl,
      queryBuilderElRect,
      hoveredItem,
      maxNestingLevel,
      isSmallerScreen,
      isActivelyModifyingValues,
    }
  })()
}
