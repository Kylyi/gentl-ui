import { config } from '~/config'

// Types
import type { ITableProps } from '~/components/Table/types/table-props.type'

// Models
import { TableColumn } from '~/components/Table/models/table-column.model'
import { GroupItem } from '~/libs/App/data/models/group-item.model'
import { FilterItem } from '~/libs/App/data/models/filter-item'

// Functions
import { useTableUtils } from '~/components/Table/functions/useTableUtils'

// Injections
import {
  tableColumnsKey,
  tableColumnsRecreateKey,
  tableNonHelpersColumnsKey,
} from '~/components/Table/provide/table.provide'

// Regex
import { stringToFloat } from '~/libs/App/data/regex/string-to-float.regex'

// Store
import { useTableStore } from '~/components/Table/table.store'

type Options = {
  groupsRef?: MaybeRefOrGetter<GroupItem[]>
  minColWidthRef?: MaybeRefOrGetter<number>
  expandIconWidthRef?: MaybeRefOrGetter<number>
  groupExpandWidthRef?: MaybeRefOrGetter<number>
  isSelectableRef?: MaybeRefOrGetter<boolean>
}

export function useTableColumns(
  props: ITableProps,
  columnsRef: Ref<TableColumn[]>
) {
  // Utils
  const { t } = useI18n()
  const { scrollbarWidth, isOverflown } = useOverflow()
  const { parseUrlParams, hasVisibleCol, getStorageKey } = useTableUtils()

  // Store
  const { getTableState } = useTableStore()
  const tableState = getTableState(getStorageKey())

  // Layout
  const originalColumns = columnsRef.value.map(
    (col: any) => new TableColumn(col)
  )
  const internalColumns = ref<TableColumn[]>([])
  createInternalColumns()

  const nonHelpersColumns = computed(() =>
    internalColumns.value.filter(col => !col.isHelperCol)
  )

  // Provide
  provide(tableColumnsKey, internalColumns)
  provide(tableNonHelpersColumnsKey, nonHelpersColumns)
  provide(tableColumnsRecreateKey, () => createInternalColumns(true))

  const searchableColumnLabels = computed(() => {
    return columnsRef.value.filter(col => col.searchable).map(col => col._label)
  })

  const hasVisibleColumn = computed(() => hasVisibleCol(internalColumns.value))

  /**
   * Reorders and handles the column visibility based on the URL
   * Note: Mutates the columns
   */
  function handleColumnsVisibility(_columns: TableColumn[]) {
    const { columns: visibleColumns } = parseUrlParams()

    // When columns are provided in the URL, we set the visibility for the columns
    // that are in the URL and reset it for the others
    if (visibleColumns?.length) {
      _columns.forEach(col => {
        const colInUrl = visibleColumns.indexOf(col.field)

        if (colInUrl > -1 || col.isHelperCol) {
          col.hidden = false
          col._internalSort = col.isHelperCol ? -1 : colInUrl
        } else {
          col.hidden = true
        }
      })

      // We reorder the columns based on the `_internalSort` property
      _columns.sort((a, b) => {
        if (a._internalSort === undefined || b._internalSort === undefined) {
          return 0
        }

        return a._internalSort - b._internalSort
      })
    }

    return _columns
  }

  /**
   * Will put the filters and sorting from URL or from TableState into the columns
   * Note: Mutates the columns
   */
  function handleColumnsData(_columns: TableColumn[]) {
    const {
      sort,
      filters,
      columns: visibleColumns,
      queryBuilder: queryBuilderFromUrl,
    } = parseUrlParams()
    const { columns: stateColumns } = tableState.value

    const isUrlUsed =
      !!sort.length ||
      !!filters.length ||
      !!visibleColumns?.length ||
      !!queryBuilderFromUrl?.length

    // When sorting is provided in the URL, we set the sorting for the columns
    // that are in the URL and reset it for the others
    if (sort) {
      _columns.forEach(col => {
        const sortInUrlIdx = sort.findIndex(
          sortItem => sortItem.field === col.field
        )
        const sortInUrl = sort[sortInUrlIdx]

        if (sortInUrl) {
          col.sort = sortInUrl.sort
          col.sortOrder = sortInUrlIdx + 1
        } else {
          col.sort = undefined
          col.sortOrder = undefined
        }
      })
    }

    // When filters are provided in the URL, we set the filters for the columns
    filters?.forEach(filter => {
      if ('isGroup' in filter) {
        return
      }

      const col = _columns.find(col => col.field === filter.field)

      if (col) {
        col.filters.push(
          new FilterItem<any>({
            field: filter.field,
            comparator: filter.comparator,
            value: parseValue(filter.value, col.dataType),
          })
        )
      }
    })

    // When columns are present in the table state, we set the appropriate data
    stateColumns?.forEach((stateColumn, idx) => {
      const col = _columns.find(col => col.field === stateColumn.field)

      if (col) {
        // We set the `filters`, `sorting`, `visibility` only in case we don't use
        // server state management and we didn't provide anything in the URL
        if (!config.table.useServerState && !isUrlUsed) {
          col.filters = stateColumn.filters.map(
            filter => new FilterItem(filter)
          )
          col.sort = stateColumn.sort
          col.sortOrder = stateColumn.sortOrder
          col.hidden = stateColumn.hidden
          col._internalSort = idx
        }

        // We set the column width
        col.width = stateColumn.width
      }
    })

    // We reorder the columns based on the `_internalSort` property
    // The _internalSort property is set only when no table URL was provided
    _columns.sort((a, b) => {
      if (a._internalSort === undefined || b._internalSort === undefined) {
        return 0
      }

      return a._internalSort - b._internalSort
    })

    return _columns
  }

  /**
   * Will add `helper` columns to the table
   *  - selection
   *  - group expansion
   */
  function extendColumns(columns: TableColumn[], options?: Options) {
    const { groupsRef = [] } = options || {}
    const groups = toValue(groupsRef)
    const isSelectable = !!props.selectable
    const groupExpandWidth = props.groupExpandWidth || 28

    // We create a copy of the columns but we keep the reference to the original
    // column objects so we can mutate them
    const _columns = [...columns]

    // Groups
    // TODO: Implement groups
    _columns.unshift(
      ...groups.map(
        (group, idx) =>
          new TableColumn({
            field: `_group_${group.name}`,
            width: `${idx ? groupExpandWidth / 1.5 : groupExpandWidth}px`,
            hideLabel: true,
            isHelperCol: true,
          })
      )
    )

    // Selection
    if (isSelectable) {
      _columns.unshift(
        new TableColumn({
          field: '_selectable',
          width: '40px',
          hideLabel: true,
          isHelperCol: true,
          label: t('table.selectable'),
          headerClasses: 'flex-center',
        })
      )
    }

    return _columns
  }

  /**
   * Recalculates the columns
   */
  function resizeColumns(
    containerElRef: MaybeRefOrGetter<Element>,
    wrapperElRef: MaybeRefOrGetter<Element>,
    internalColumnsRef: MaybeRefOrGetter<TableColumn[]>,
    options: Options = {}
  ) {
    const container = toValue(containerElRef)
    const wrapper = toValue(wrapperElRef)
    const containerWidth = container.clientWidth
    const isWrapperOverflown = isOverflown(wrapper, { direction: 'vertical' })

    const { minColWidthRef = 64 } = options
    const minColWidth = toValue(minColWidthRef)

    const contentWidth =
      containerWidth - Number(isWrapperOverflown) * scrollbarWidth - 1

    const cols = toValue(internalColumnsRef)

    const colsTotalWidth = cols.reduce<{ relative: number; fixed: number }>(
      (agg, col) => {
        if (!col.hidden) {
          if (typeof col.width === 'string') {
            agg.fixed += +(stringToFloat(col.width) || 0)
          } else {
            agg.relative += col.width || 1
          }
        }

        return agg
      },
      { relative: 0, fixed: 0 }
    )

    const shouldAdjustCols =
      !!colsTotalWidth.relative &&
      colsTotalWidth.relative + colsTotalWidth.fixed < contentWidth

    const colsSortedByWidth = sortBy(
      cols.filter(col => !col.hidden),
      col =>
        typeof col.width === 'string'
          ? 9999 * +(stringToFloat(col.width) || 0)
          : col.width
    )

    function calculateColWidth(
      colWidth: number,
      colsTotalWidth: number,
      componentWidth: number
    ) {
      return (componentWidth / colsTotalWidth) * colWidth
    }

    let wExtra = 0
    colsSortedByWidth.forEach(col => {
      if (typeof col.width === 'string') {
        col.adjustedWidth = col.name.startsWith('_')
          ? +(stringToFloat(col.width) || 0)
          : Math.max(+(stringToFloat(col.width) || 0), minColWidth)
      } else if (shouldAdjustCols) {
        const widthN = Math.max(
          calculateColWidth(
            col.width || 1,
            colsTotalWidth.relative,
            contentWidth - colsTotalWidth.fixed
          ),
          minColWidth,
          0
        )
        wExtra += widthN - Math.floor(widthN)

        col.adjustedWidth = Math.floor(widthN)
      } else {
        col.adjustedWidth = Math.max(col.width, minColWidth)
      }
    })

    for (let idx = 0; idx < Math.floor(wExtra); idx++) {
      const col = colsSortedByWidth[idx]
      col.adjustedWidth++
    }

    if (!colsTotalWidth.relative && isWrapperOverflown && !shouldAdjustCols) {
      const nonHelperColsSortedDesc = [...colsSortedByWidth]
        .reverse()
        .filter(col => !col.isHelperCol)
        .sort((a, b) => b.adjustedWidth - a.adjustedWidth)

      const nonHelperColsTotalWidth = nonHelperColsSortedDesc.reduce(
        (agg, col) => agg + col.adjustedWidth,
        0
      )

      nonHelperColsSortedDesc.forEach(col => {
        col.adjustedWidth -= Math.floor(
          (scrollbarWidth / nonHelperColsTotalWidth) * col.adjustedWidth
        )
      })

      if (nonHelperColsSortedDesc[0]) {
        nonHelperColsSortedDesc[0].adjustedWidth--
      }

      const lastCol = cols[cols.length - 1]

      if (lastCol) {
        lastCol.adjustedWidth += scrollbarWidth
        cols[cols.length - 1].headerStyle = {
          ...cols[cols.length - 1].headerStyle,
          marginRight: `${scrollbarWidth}px`,
        }
      }
    }

    return cols
  }

  /**
   * Creates the internal columns
   */
  function createInternalColumns(shouldRecreate?: boolean) {
    if (shouldRecreate) {
      columnsRef.value = originalColumns.map(col => new TableColumn(col))
    }

    internalColumns.value = handleColumnsData(
      handleColumnsVisibility(extendColumns(columnsRef.value))
    )
  }

  return {
    internalColumns,
    hasVisibleColumn,
    searchableColumnLabels,
    resizeColumns,
    extendColumns,
  }
}
