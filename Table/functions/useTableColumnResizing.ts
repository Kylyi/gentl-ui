import { klona } from 'klona/full'

// Models
import type { TableColumn } from '~/components/Table/models/table-column.model'

// Functions
import { stringToFloat } from '~/libs/Shared/regex/string-to-float.regex'

// Store
import { useAppStore } from '~/libs/App/app.store'
import { useTableStore } from '~/components/Table/table.store'

// Injections
import {
  tableResizeKey,
  tableRowsKey,
  tableSlotsKey,
  tableStorageKey,
  tableStretchColumnsKey,
} from '~/components/Table/provide/table.provide'

// Components
import type HorizontalScroller from '~/components/Scroller/HorizontalScroller.vue'

export type ISplitter = {
  field: TableColumn['field']
  left: number
  column: TableColumn
}

type IActiveSplitter = ISplitter & {
  minLeft: number // ~ when dragging, it cannot go lower than this
  top: number
  height: number
  column: TableColumn
  adjustedWidth: number
}

export function useTableColumnResizing(options: {
  columns: Ref<TableColumn[]>
  minimumColumnWidth?: number
}) {
  const { columns, minimumColumnWidth = 0 } = options

  // Utils
  const self = getCurrentInstance()

  // Injections
  const storageKey = injectStrict(tableStorageKey)
  const tableSlots = injectStrict(tableSlotsKey)
  const tableRows = injectStrict(tableRowsKey)
  const tableResize = injectStrict(tableResizeKey)
  const tableStretchColumns = injectStrict(tableStretchColumnsKey)

  // Store
  const appStore = useAppStore()
  const { setTableState } = useTableStore()

  // Layout
  const splitterJustClicked = refAutoReset(false, 500)
  const headerEl = ref<InstanceType<typeof HorizontalScroller>>()

  // Splitters (for resizing columns)
  let pageX = 0

  const activeSplitter = ref<IActiveSplitter>()

  const columnSplitters = computed(() => {
    const splitters: ISplitter[] = []

    if (!columns.value.length) {
      return splitters
    }

    let lastLeftPosition = 0

    columns.value
      .filter(col => !col.hidden && col.resizable)
      .forEach(col => {
        lastLeftPosition += col.adjustedWidth

        if (col.isHelperCol || !col.resizable) {
          return
        }

        splitters.push({
          field: col.field as string,
          left: lastLeftPosition,
          column: col,
        })
      })

    // We need to move the last splitter a bit to the left so it doesn't create overflow
    // But only in case the last column is actually resizable
    const lastCol = columns.value[columns.value.length - 1]

    if (lastCol.resizable && splitters.length) {
      splitters[splitters.length - 1].left -= 4
    }

    return splitters
  })

  async function handleSplitterPointerDown(
    splitter: ISplitter,
    ev: PointerEvent,
  ) {
    const col = columns.value.find(c => c.field === splitter.field)

    // Handle double-click ~ resize to fit
    if (col && splitterJustClicked.value) {
      const slotRenderFnc = tableSlots[col.field]

      await col.autoFit(
        tableRows.value,
        slotRenderFnc,
        minimumColumnWidth,
      )

      setTableState(storageKey.value, { columns: columns.value })
      self?.emit('resized', col)

      return
    }

    const splitterCopy = klona(omit(splitter, ['column']))
    // @ts-expect-error some weird type
    const headerDom = unrefElement(headerEl)!
    const { y: headerY, height: headerHeight } = headerDom.getBoundingClientRect()

    const { height: tableHeight }
      = (headerDom.parentElement!.querySelector('.virtual-scroll__content') as HTMLElement)
        .getBoundingClientRect()

    pageX = ev.pageX

    activeSplitter.value = {
      ...splitterCopy,
      left: pageX,
      minLeft: ev.pageX - col!.adjustedWidth + minimumColumnWidth - 4, // 4px is the middle of the splitter
      top: headerY,
      height: headerHeight + tableHeight,
      column: col!,
      adjustedWidth: col!.adjustedWidth,
    }

    document.documentElement.style.cursor = 'col-resize'
    document.documentElement.style.userSelect = 'none'

    document.documentElement.addEventListener(
      'pointermove',
      handleSplitterPointerMove,
    )
    document.documentElement.addEventListener(
      'pointerup',
      handleSplitterPointerUp,
    )

    splitterJustClicked.value = true
  }

  function handleSplitterPointerMove(ev: PointerEvent) {
    if (activeSplitter.value) {
      activeSplitter.value.left = Math.max(
        activeSplitter.value.minLeft!,
        ev.pageX,
      )

      activeSplitter.value.adjustedWidth
        = activeSplitter.value.column.adjustedWidth
        + activeSplitter.value.left
        - pageX
    }
  }

  function handleSplitterPointerUp() {
    let column: TableColumn
    const diff
      = activeSplitter.value!.adjustedWidth
      - activeSplitter.value!.column.adjustedWidth

    // If the currently resized column is `semiFrozen` but not `frozen`,
    // we need to adjust the widths of all the `semiFrozen` columns that come
    // after it
    if (
      activeSplitter.value!.column.semiFrozen
      && !activeSplitter.value!.column.frozen
    ) {
      const colIdx = columns.value.findIndex(
        col => col.field === activeSplitter.value!.column.field,
      )
      column = columns.value[colIdx]
      const lastSemiFrozenColIdx = columns.value
        .slice(colIdx)
        .findIndex(col => !col.semiFrozen)

      const semiFrozenColumns = columns.value.slice(
        colIdx + 1,
        colIdx + lastSemiFrozenColIdx,
      )

      semiFrozenColumns.forEach(col => {
        if (typeof col.headerStyle.left === 'string') {
          const left = Number(stringToFloat(col.headerStyle.left) || 0)

          col.headerStyle.left = `${left + diff}px`
        }
      })
    }

    // Set the width of the column we're resizing to the new width
    activeSplitter.value!.column.setWidth(
      `${activeSplitter.value!.adjustedWidth}px`,
    )

    // Reset the active splitter
    activeSplitter.value = undefined

    document.documentElement.removeEventListener(
      'pointermove',
      handleSplitterPointerMove,
    )
    document.documentElement.removeEventListener(
      'pointerup',
      handleSplitterPointerUp,
    )

    setTableState(storageKey.value, { columns: columns.value })

    nextTick(() => {
      document.documentElement.style.cursor = ''
      document.documentElement.style.userSelect = ''

      headerEl.value?.updateArrows()
      self?.emit('resized', column)
    })
  }

  /**
   * Fits the columns based on their content
   */
  function fitColumns(stretch?: boolean) {
    if (!tableRows.value?.length) {
      return
    }

    const fittableColumns = columns.value.filter(
      col => col.resizable && !col.hidden && !col.isHelperCol,
    )

    // We unfreeze any frozen column
    const frozenColumn = fittableColumns.find(col => col.frozen)
    frozenColumn?.freeze(fittableColumns)

    setTimeout(async () => {
      // We autofit the columns
      for await (const col of fittableColumns) {
        const slotRenderFnc = tableSlots[col.field]

        await col.autoFit(
          tableRows.value,
          slotRenderFnc,
          minimumColumnWidth,
        )
      }

      // We stretch the columns
      if (stretch) {
        tableStretchColumns()
      }

      // We freeze the column again
      frozenColumn?.freeze(fittableColumns)

      setTableState(storageKey.value, { columns: columns.value })
      nextTick(() => self?.emit('resized'))
    }, 0)
  }

  function handleFitColumns(fit?: 'content' | 'stretch' | 'auto' | null) {
    if (!tableRows.value?.length) {
      return
    }

    let mode = fit

    if (!mode) {
      mode = appStore.appState.table?.fit
    }

    if (mode === 'content') {
      nextTick(() => fitColumns())
    } else if (mode === 'stretch') {
      nextTick(() => fitColumns(true))
    } else if (mode === 'auto') {
      nextTick(() => {
        columns.value.forEach(col => {
          col.width = col.originalWidth
        })

        tableResize()
      })
    }
  }

  return {
    headerEl,
    activeSplitter,
    columnSplitters,
    handleFitColumns,
    fitColumns,
    handleSplitterPointerDown,
  }
}
