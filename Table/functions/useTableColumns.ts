import { config } from '~/components/config/components-config'

// Types
import type { ITableProps } from '~/components/Table/types/table-props.type'
import type { ITableLayout } from '~/components/Table/types/table-layout.type'

// Models
import { TableColumn } from '~/components/Table/models/table-column.model'
import { FilterItem } from '~/libs/Shared/models/filter-item'
import type { GroupItem } from '~/libs/Shared/models/group-item.model'

// Functions
import { useTableUtils } from '~/components/Table/functions/useTableUtils'

// Injections
import {
  tableColumnsKey,
  tableColumnsRecreateKey,
  tableNonHelperColumnsKey,
} from '~/components/Table/provide/table.provide'

// Regex
import { stringToFloat } from '~/libs/Shared/regex/string-to-float.regex'

// Store
import { useTableStore } from '~/components/Table/table.store'
import { useAppStore } from '~/libs/App/app.store'

type Options = {
  groupsRef?: MaybeRefOrGetter<GroupItem[]>
  minColWidthRef?: MaybeRefOrGetter<number>
  expandIconWidthRef?: MaybeRefOrGetter<number>
  groupExpandWidthRef?: MaybeRefOrGetter<number>
  isSelectableRef?: MaybeRefOrGetter<boolean>
}

// Helpers
function calculateColWidth(
  colWidth: number,
  colsTotalWidth: number,
  componentWidth: number,
) {
  return (componentWidth / colsTotalWidth) * colWidth
}

export function useTableColumns(
  props: ITableProps,
  columnsRef: Ref<TableColumn[]>,
  layoutRef: Ref<ITableLayout | undefined>,
) {
  // Utils
  const route = useRoute()
  const { t, locale } = useI18n()
  const { scrollbarWidth, isOverflown } = useOverflow()
  const { parseUrlParams, hasVisibleCol, getStorageKey } = useTableUtils(props)

  // Store
  const appStore = useAppStore()
  const { getTableState, setTableState } = useTableStore()
  const tableState = getTableState(getStorageKey())

  // Layout
  const originalColumns = columnsRef.value.map(
    (col: any) => new TableColumn(col),
  )
  const internalColumns = ref<TableColumn[]>([])
  createInternalColumns()

  const nonHelpersColumns = computed(() => {
    return internalColumns.value.filter(col => !col.isHelperCol)
  })

  // Provide
  provide(tableColumnsKey, internalColumns)
  provide(tableNonHelperColumnsKey, nonHelpersColumns)
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
      fromSchema: !!layoutRef.value?.schema,
    })

    let visibleColumns = urlVisibleColumns.length
      ? urlVisibleColumns
      : schemaVisibleColumns

    visibleColumns = config.table.allowCaseInsensitiveColumns
      ? visibleColumns.map(col => col.toLowerCase())
      : visibleColumns

    // When columns are provided in the URL or in the layout schema, we set
    //  visibility for the columns that are present and reset it for the others
    if (visibleColumns?.length || schemaVisibleColumns?.length) {
      _columns.forEach(col => {
        const colField = config.table.allowCaseInsensitiveColumns
          ? col.field.toLowerCase()
          : col.field
        const colInUrl = visibleColumns.indexOf(colField)

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
    const fromSchema = route.query.fromSchema === 'true'

    const {
      sort: urlSort,
      filters: urlFilters,
      columns: urlVisibleColumns,
      queryBuilder: urlQueryBuilder,
    } = parseUrlParams({ columnsRef: _columns, fromSchema })

    const { schemaSort, filters: schemaFilters } = parseUrlParams({
      columnsRef: _columns,
      searchParams: layoutRef.value?.schema ?? ' ',
      fromSchema: !!layoutRef.value?.schema,
    })

    const { columns: stateColumns } = tableState.value
    const shouldUrlBeUsed = props.useUrl

    const isUrlUsed
      = !!urlSort.length
      || !!urlFilters.length
      || !!urlVisibleColumns?.length
      || !!urlQueryBuilder?.length

    // When something is present in the URL, we just use that,
    // otherwise we use the schema
    const sort = isUrlUsed ? urlSort : schemaSort
    const filters = isUrlUsed && shouldUrlBeUsed ? urlFilters : schemaFilters

    // When sorting is provided in the URL, we set the sorting for the columns
    // that are in the URL and reset it for the others
    if (sort?.length) {
      _columns.forEach(col => {
        const sortInUrlIdx = sort.findIndex(
          sortItem => sortItem.field === col.field,
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

      const col = _columns.find(col => {
        return (
          col.field === filter.field || col.filterField === filter.filterField
        )
      })

      if (col) {
        // We check if it is one of the predefined filters and eventually merge
        // it together with the filter from the URL
        const predefinedFilter = col.filters.find(
          f => f.comparator === filter.comparator,
        )

        const filterValue = Array.isArray(filter.value)
          ? filter.value.map(val =>
            parseValue(val, col.dataType, { dateFormat: 'YYYY-MM-DD' }),
          )
          : parseValue(filter.value, col.dataType, { dateFormat: 'YYYY-MM-DD' })

        if (predefinedFilter) {
          predefinedFilter.value = filterValue
        } else {
          col.filters.push(
            new FilterItem<any>({
              field: col.field,
              filterField: col.filterField,
              comparator: filter.comparator,
              format: col.format,
              dataType: col.dataType,
              value: filterValue,
            }),
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
        const shouldUseState = !!appStore.appState.table?.autoSaveSchema

        if (shouldUseState && !isUrlUsed && !props.initialLayoutSchema) {
          const nonInteractiveFilters = col.filters.filter(filter => {
            return filter.nonInteractive
          })
          col.filters = [
            ...nonInteractiveFilters,
            ...stateColumn.filters
              .filter(filter => !filter.nonInteractive)
              .map(filter => new FilterItem({ ...filter, format: col.format })),
          ]
          col.sort = stateColumn.sort
          col.sortOrder = stateColumn.sortOrder
          col.hidden = stateColumn.hidden
          col._internalSort = idx
        }

        // We set the column data that we save in `localStorage`
        if (typeof stateColumn.width === 'string') {
          col.setWidth(stateColumn.width)
        }

        // TODO: This can be done better (without the arbitrary timeout...)
        setTimeout(() => {
          if (stateColumn.frozen) {
            col.freeze(_columns)
          }
        }, 500)
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
    const isSelectable = !!props.selectionOptions?.selectable
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
          }),
      ),
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
        }),
      )
    }

    return _columns
  }

  function getColumnSizes(
    containerElRef: MaybeRefOrGetter<Element>,
    wrapperElRef: MaybeRefOrGetter<Element>,
    internalColumnsRef: MaybeRefOrGetter<TableColumn[]>,
    options: Options = {},
  ) {
    const container = toValue(containerElRef)
    const wrapper = toValue(wrapperElRef)
    const containerWidth = container.clientWidth
    const isWrapperOverflownVertically = isOverflown(wrapper, {
      direction: 'vertical',
    })

    const { minColWidthRef = 64 } = options
    const minColWidth = toValue(minColWidthRef)

    const contentWidth
      = containerWidth - Number(isWrapperOverflownVertically) * scrollbarWidth - 1

    const cols = toValue(internalColumnsRef)

    // We split the columns into strictly defined (~ with fixed width)
    // and relative (~ with relative width)
    const colsTotalWidth = cols.reduce<{ relative: number, fixed: number }>(
      (agg, col) => {
        if (!col.hidden) {
          if (typeof col.width === 'string') {
            if (col.width === 'fit-label') {
              const columnLabelCharsLength = col.label.length

              // These numbers are arbitrary
              agg.fixed += columnLabelCharsLength * 8 + 40
            } else {
              agg.fixed += +(stringToFloat(col.width) || 0)
            }
          } else {
            agg.relative += col.width || 1
          }
        }

        return agg
      },
      { relative: 0, fixed: 0 },
    )

    // We can stretch the columns if the total width of the columns is smaller
    // than the width of the table
    const totalWidth = colsTotalWidth.fixed + colsTotalWidth.relative
    const canStretchCols
      = totalWidth < contentWidth && Math.abs(totalWidth - contentWidth) > 1

    // We check if we need to adjust the columns
    // Adjusting the columns mean that we stretch the columns that have relative width
    const shouldAdjustCols = !!colsTotalWidth.relative && canStretchCols

    return {
      minColWidth,
      colsTotalWidth,
      shouldAdjustCols,
      cols,
      contentWidth,
      isWrapperOverflownVertically,
      canStretchCols,
    }
  }

  /**
   * Recalculates the columns widths
   */
  function resizeColumns(
    containerElRef: MaybeRefOrGetter<Element>,
    wrapperElRef: MaybeRefOrGetter<Element>,
    internalColumnsRef: MaybeRefOrGetter<TableColumn[]>,
    options: Options = {},
  ) {
    const {
      cols,
      colsTotalWidth,
      contentWidth,
      isWrapperOverflownVertically,
      minColWidth,
      shouldAdjustCols,
    } = getColumnSizes(
      containerElRef,
      wrapperElRef,
      internalColumnsRef,
      options,
    )

    // When stretching the columns, we use some rounding. This rounding may add
    // up to some extra pixels that we need to distribute to the columns relative columns
    // so we sort the `relative` columns by its width and later stretch them
    // from the smallest to the biggest
    const colsSortedByWidth = sortBy(
      cols.filter(col => !col.hidden),
      (col: TableColumn) =>
        typeof col.width === 'string'
          ? 9999 * +(stringToFloat(col.width) || 0)
          : col.width,
    ) as TableColumn[]

    let wExtra = 0
    colsSortedByWidth.forEach(col => {
      // NOTE - We reset the `headerStyle`, specifically the `marginRight`.
      // `marginRight` is added to the last column in the table when the table
      // is horizontally overflown. We need to reset it here because we recalculate
      // it below
      col.headerStyle = {
        ...col.headerStyle,
        marginRight: undefined,
      }

      const labelChars = col.hideLabel ? 0 : col.label.length
      const colMinWidth = col.minWidth || labelChars * 8 // These numbers are arbitrary

      if (typeof col.width === 'string') {
        if (col.width === 'fit-label') {
          const columnLabelCharsLength = col.label.length

          col.adjustedWidth = Math.max(
            columnLabelCharsLength * 8 + 20,
            col.minWidth || 0,
          ) // These numbers are arbitrary
        } else {
          col.adjustedWidth = col.name.startsWith('_')
            ? +(stringToFloat(col.width) || 0)
            : Math.max(+(stringToFloat(col.width) || 0), minColWidth)
        }
      } else if (shouldAdjustCols) {
        const widthN = Math.max(
          calculateColWidth(
            col.width || 1,
            colsTotalWidth.relative,
            contentWidth - colsTotalWidth.fixed,
          ),
          minColWidth,
          colMinWidth || 0,
        )
        wExtra += widthN - Math.floor(widthN)

        col.adjustedWidth = Math.floor(widthN)
      } else {
        col.adjustedWidth = Math.max(col.width, minColWidth, colMinWidth || 0)
      }
    })

    // We add the extra width to the smallest columns
    for (let idx = 0; idx < Math.floor(wExtra); idx++) {
      const col = colsSortedByWidth[idx]
      col.adjustedWidth++
    }

    if (
      !colsTotalWidth.relative
      && isWrapperOverflownVertically
      && !shouldAdjustCols
    ) {
      const nonHelperColsSortedDesc = [...colsSortedByWidth]
        .reverse()
        .filter(col => !col.isHelperCol)
        .sort((a, b) => b.adjustedWidth - a.adjustedWidth)

      const nonHelperColsTotalWidth = nonHelperColsSortedDesc.reduce(
        (agg, col) => agg + col.adjustedWidth,
        0,
      )

      nonHelperColsSortedDesc.forEach(col => {
        col.adjustedWidth -= Math.floor(
          (scrollbarWidth / nonHelperColsTotalWidth) * col.adjustedWidth,
        )
      })

      if (nonHelperColsSortedDesc[0]) {
        nonHelperColsSortedDesc[0].adjustedWidth--
      }
    }

    // We add extra width to the last column if the wrapper is overflown horizontally
    // and vertically
    const totalVisibleColumnsWidth = cols.reduce((agg, col) => {
      if (!col.hidden) {
        agg += col.adjustedWidth
      }

      return agg
    }, 0)
    const isWrapperOverflownHorizontally
      = totalVisibleColumnsWidth > contentWidth

    if (isWrapperOverflownHorizontally && isWrapperOverflownVertically) {
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
   * Stretches the columns to fit the table width
   */
  function stretchColumns(
    containerElRef: MaybeRefOrGetter<Element>,
    wrapperElRef: MaybeRefOrGetter<Element>,
    internalColumnsRef: MaybeRefOrGetter<TableColumn[]>,
    options: Options = {},
  ) {
    const {
      canStretchCols,
      cols,
      colsTotalWidth,
      contentWidth,
      isWrapperOverflownVertically,
    } = getColumnSizes(
      containerElRef,
      wrapperElRef,
      internalColumnsRef,
      options,
    )

    if (canStretchCols) {
      // When stretching the columns, we use some rounding. This rounding may add
      // up to some extra pixels that we need to distribute to the columns relative columns
      // so we sort the `relative` columns by its width and later stretch them
      // from the smallest to the biggest
      const colsSortedByWidth = sortBy(
        cols.filter(col => !col.hidden),
        (col: TableColumn) => {
          const w = col.isHelperCol
            ? 9999 * col.adjustedWidth || 0
            : col.adjustedWidth

          return w
        },
      ) as TableColumn[]

      const helperColsWidth = colsSortedByWidth.reduce((agg, col) => {
        if (col.isHelperCol) {
          agg += col.adjustedWidth
        }

        return agg
      }, 0)

      const _scrollbarWidth = Number(isWrapperOverflownVertically) * scrollbarWidth
      const _contentWidth = contentWidth + _scrollbarWidth - 1 - helperColsWidth
      const _colsTotalWidth = colsTotalWidth.relative + colsTotalWidth.fixed - helperColsWidth

      let wExtra = 0
      colsSortedByWidth.forEach(col => {
        if (!col.isHelperCol) {
          const widthN = (_contentWidth / _colsTotalWidth) * col.adjustedWidth

          wExtra += widthN - Math.floor(widthN)

          col.adjustedWidth = Math.floor(widthN)
        }
      })

      // We add the extra width to the smallest columns
      for (let idx = 0; idx < Math.floor(wExtra); idx++) {
        const col = colsSortedByWidth[idx]
        col.adjustedWidth++
      }

      cols.forEach(col => col.setWidth(`${col.adjustedWidth}px`))
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
      handleColumnsVisibility(extendColumns(columnsRef.value)),
    )
  }

  // Sync the column labels on locale change
  watch(locale, () => {
    setTimeout(() => {
      internalColumns.value.forEach(col => {
        const foundColumn = props.columns?.find(c => c.field === col.field)

        if (foundColumn) {
          col.label = foundColumn.label
        } else if (props.translationPrefix) {
          col.label = $t(`${props.translationPrefix}.${col.field}`)
        }
      })
    }, 0)
  })

  return {
    internalColumns,
    hasVisibleColumn,
    searchableColumnLabels,
    // scrollbarWidth: computed(() => (isOverflown.value ? scrollbarWidth : 0)),
    resizeColumns,
    stretchColumns,
    extendColumns,
    recreateColumns: createInternalColumns,
  }
}
