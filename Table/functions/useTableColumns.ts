// TYPES
import { ITableProps } from '~/components/Table/types/table-props.type'
import { ITableState } from '~/components/Table/types/table-state.type'

// MODELS
import { TableColumn } from '~/components/Table/models/table-column.model'
import { GroupItem } from '~/libs/App/data/models/group-item.model'

// REGEX
import { stringToFloat } from '~/libs/App/data/regex/string-to-float.regex'
import { useTableUtils } from '~/components/Table/functions/useTableUtils'

type Options = {
  groupsRef?: MaybeRefOrGetter<GroupItem[]>
  minColWidthRef?: MaybeRefOrGetter<number>
  expandIconWidthRef?: MaybeRefOrGetter<number>
  groupExpandWidthRef?: MaybeRefOrGetter<number>
  isSelectableRef?: MaybeRefOrGetter<boolean>
}

// FIXME: This won't work with SSR
function getTableState(storageKey?: string): ITableState {
  return JSON.parse((storageKey && localStorage.getItem(storageKey)) || '{}')
}

export function useTableColumns(props: Pick<ITableProps, 'storageKey'>) {
  // UTILS
  const { storageKey } = useTableUtils(props)
  const { scrollbarWidth, isOverflown } = useOverflow()

  /**
   * Will add `helper` columns to the table
   *  - selection
   *  - group expansion
   *
   * Also will merge the column with any state that is saved in the local storage
   */
  const extendColumns = (columns: TableColumn[], options?: Options) => {
    const {
      groupsRef = [],
      groupExpandWidthRef = 28,
      isSelectableRef,
    } = options || {}
    const groups = toValue(groupsRef)
    const isSelectable = toValue(isSelectableRef)
    const groupExpandWidth = toValue(groupExpandWidthRef)

    const tableState = getTableState(storageKey)
    const cols = tableState.columns || []

    columns.forEach(col => {
      const savedColIdx = cols.findIndex(c => c.field === col.field)

      if (savedColIdx > -1) {
        const savedCol = cols[savedColIdx]

        Object.assign(col, savedCol, { _internalSort: savedColIdx })
      }
    })

    columns.sort((a, b) => (a._internalSort || 0) - (b._internalSort || 0))

    columns.unshift(
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

    isSelectable &&
      columns.unshift(
        new TableColumn({
          field: '_selectable',
          width: '40px',
          hideLabel: true,
          isHelperCol: true,
        })
      )

    return columns
  }

  /**
   * Recalculates the columns
   */
  const resizeColumns = (
    containerElRef: MaybeRefOrGetter<Element>,
    wrapperElRef: MaybeRefOrGetter<Element>,
    columnsRef: MaybeRefOrGetter<TableColumn[]>,
    options: Options = {}
  ) => {
    const container = toValue(containerElRef)
    const wrapper = toValue(wrapperElRef)
    const containerWidth = container.clientWidth
    const isWrapperOverflown = isOverflown(wrapper, { direction: 'vertical' })

    const { minColWidthRef = 64 } = options
    const minColWidth = toValue(minColWidthRef)

    const contentWidth =
      containerWidth - Number(isWrapperOverflown) * scrollbarWidth - 1

    const cols = [...toValue(columnsRef)].filter(col => !col.hidden)
    extendColumns(cols, options)

    const colsTotalWidth = cols.reduce<{ relative: number; fixed: number }>(
      (agg, col) => {
        if (typeof col.width === 'string') {
          agg.fixed += +(stringToFloat(col.width) || 0)
        } else {
          agg.relative += col.width || 1
        }

        return agg
      },
      { relative: 0, fixed: 0 }
    )

    const shouldAdjustCols =
      !!colsTotalWidth.relative &&
      colsTotalWidth.relative + colsTotalWidth.fixed < contentWidth

    const colsSortedByWidth = sortBy(cols, col =>
      typeof col.width === 'string'
        ? 9999 * +(stringToFloat(col.width) || 0)
        : col.width
    )

    const calculateColWidth = (
      colWidth: number,
      colsTotalWidth: number,
      componentWidth: number
    ) => {
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

      nonHelperColsSortedDesc[0].adjustedWidth--

      const lastCol = cols[cols.length - 1]

      lastCol.adjustedWidth += scrollbarWidth
      cols[cols.length - 1].headerStyle = {
        ...cols[cols.length - 1].headerStyle,
        marginRight: `${scrollbarWidth}px`,
      }
    }

    return cols
  }

  return { resizeColumns, extendColumns }
}
