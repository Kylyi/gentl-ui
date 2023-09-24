import { config } from '~/config'

// Types
import type { ITableProps } from '~/components/Table/types/table-props.type'
import type { ITableLayout } from '~/components/Table/types/table-layout.type'

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
  columnsRef: Ref<TableColumn[]>,
  layoutRef: Ref<ITableLayout | undefined>
) {
  // Utils
  const { t, locale } = useI18n()
  const { scrollbarWidth, isOverflown } = useOverflow()
  const { parseUrlParams, hasVisibleCol, getStorageKey } = useTableUtils(props)

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
    return columnsRef.value.filter(col => col.searchable).map(col => col.label)
  })

  const hasVisibleColumn = computed(() => hasVisibleCol(internalColumns.value))

  /**
   * Reorders and handles the column visibility based on the URL
   * Note: Mutates the columns
   */
  function handleColumnsVisibility(_columns: TableColumn[]) {
    const { columns: urlVisibleColumns } = parseUrlParams({
      columnsRef: _columns,
    })
    const { columns: schemaVisibleColumns } = parseUrlParams({
      columnsRef: _columns,
      searchParams: layoutRef.value?.schema,
    })

    const visibleColumns = urlVisibleColumns.length
      ? urlVisibleColumns
      : schemaVisibleColumns

    // When columns are provided in the URL or in the layout schema, we set
    //  visibility for the columns that are present and reset it for the others
    if (visibleColumns?.length || schemaVisibleColumns?.length) {
      _columns.forEach(col => {
        const colInUrl = visibleColumns.indexOf(col.field)

        if ((colInUrl > -1 || col.isHelperCol) && !col.nonInteractive) {
          col.hidden = false
          col._internalSort = col.isHelperCol ? -1 : colInUrl
        } else {
          col.hidden = true
        }
      })

      // We reorder the columns based on the `_internalSort` property
      // Sort the columns based on the `_internalSort`
      _columns.sort((a, b) => {
        if (a._internalSort === undefined) {
          return 1
        }

        if (b._internalSort === undefined) {
          return -1
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
      sort: urlSort,
      filters: urlFilters,
      columns: urlVisibleColumns,
      queryBuilder: urlQueryBuilder,
    } = parseUrlParams({ columnsRef: _columns })

    const { schemaSort, filters: schemaFilters } = parseUrlParams({
      columnsRef: _columns,
      searchParams: layoutRef.value?.schema,
    })

    const { columns: stateColumns } = tableState.value

    const isUrlUsed =
      !!urlSort.length ||
      !!urlFilters.length ||
      !!urlVisibleColumns?.length ||
      !!urlQueryBuilder?.length

    // When something is present in the URL, we just use that,
    // otherwise we use the schema
    const sort = isUrlUsed ? urlSort : schemaSort
    const filters = isUrlUsed ? urlFilters : schemaFilters

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
        // We check if it is one of the predefined filters and eventually merge
        // it together with the filter from the URL
        const predefinedFilter = col.filters.find(
          f => f.comparator === filter.comparator
        )

        if (predefinedFilter) {
          predefinedFilter.value = parseValue(filter.value, col.dataType, {
            dateFormat: 'YYYY-MM-DD',
          })
        } else {
          col.filters.push(
            new FilterItem<any>({
              field: filter.field,
              comparator: filter.comparator,
              value: parseValue(filter.value, col.dataType, {
                dateFormat: 'YYYY-MM-DD',
              }),
            })
          )
        }
      }
    })

    // When columns are present in the table state, we set the appropriate data
    // based on used mode (server or local)
    stateColumns?.forEach((stateColumn, idx) => {
      const col = _columns.find(col => col.field === stateColumn.field)

      if (col) {
        // We set the `filters`, `sorting`, `visibility` only in case we don't use
        // server state management and we didn't provide anything in the URL
        if (
          (!config.table.useServerState ||
            config.table.useLocalStorageForDefaultLayout) &&
          !isUrlUsed
        ) {
          col.filters = stateColumn.filters.map(
            filter => new FilterItem(filter)
          )
          col.sort = stateColumn.sort
          col.sortOrder = stateColumn.sortOrder
          col.hidden = stateColumn.hidden
          col._internalSort = idx
        }

        // We set the column data that we save in `localStorage`
        col.width = stateColumn.width

        // TODO: Broken frozen columns on init
        // col.frozen = stateColumn.frozen
        // col.semiFrozen = stateColumn.semiFrozen
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

    // We split the columns into strictly defined (~ with fixed width)
    // and relative (~ with relative width)
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

    // We check if we need to adjust the columns
    // Adjusting the columbs mean that we stretch the columns that have relative width
    const shouldAdjustCols =
      !!colsTotalWidth.relative &&
      colsTotalWidth.relative + colsTotalWidth.fixed < contentWidth

    // When stretching the columns, we use some rounding. This rounding may add
    // up to some extra pixels that we need to distribute to the columns relative columns
    // so we sort the `relative` columns by its width and later stretch them
    // from the smallest to the biggest
    const colsSortedByWidth = sortBy(
      cols.filter(col => !col.hidden),
      (col: TableColumn) =>
        typeof col.width === 'string'
          ? 9999 * +(stringToFloat(col.width) || 0)
          : col.width
    ) as TableColumn[]

    function calculateColWidth(
      colWidth: number,
      colsTotalWidth: number,
      componentWidth: number
    ) {
      return (componentWidth / colsTotalWidth) * colWidth
    }

    let wExtra = 0
    colsSortedByWidth.forEach(col => {
      const labelChars = col.hideLabel ? 0 : col.label.length
      const colMinWidth = col.minWidth || labelChars * 8 + 80 // These numbers are arbitrary

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
          colMinWidth || 0
        )
        wExtra += widthN - Math.floor(widthN)

        col.adjustedWidth = Math.floor(widthN)
      } else {
        col.adjustedWidth = Math.max(col.width, minColWidth, colMinWidth || 0)
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
    }

    // We add extra width to the last column if the wrapper is overflown horizontally
    const totalVisibleColumnsWidth = cols.reduce((agg, col) => {
      if (!col.hidden) {
        agg += col.adjustedWidth
      }

      return agg
    }, 0)
    const isWrapperOverflownHorizontally =
      totalVisibleColumnsWidth > contentWidth

    if (isWrapperOverflownHorizontally) {
      const lastVisibleNonHelperCol = cols
        .filter(col => !col.isHelperCol)
        .reverse()
        .find(col => !col.hidden)

      if (lastVisibleNonHelperCol) {
        lastVisibleNonHelperCol.adjustedWidth += scrollbarWidth
        lastVisibleNonHelperCol.headerStyle = {
          ...lastVisibleNonHelperCol.headerStyle,
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

  // Sync the column labels on locale change
  watch(locale, () => {
    internalColumns.value.forEach(col => {
      const foundColumn = props.columns?.find(c => c.field === col.field)

      if (foundColumn) {
        col.label = foundColumn.label
      } else {
        col.label = $t(`${props.translationPrefix}.${col.field}`)
      }
    })
  })

  return {
    internalColumns,
    hasVisibleColumn,
    searchableColumnLabels,
    resizeColumns,
    extendColumns,
    recreateColumns: createInternalColumns,
  }
}
