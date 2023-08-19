import { klona } from 'klona'

// Models
import { TableColumn } from '~/components/Table/models/table-column.model'

// Models
import { useTableStore } from '~/components/Table/table.store'

// Functions
import { stringToFloat } from '~/libs/App/data/regex/string-to-float.regex'

// Injections
import { tableStorageKey } from '~/components/Table/provide/table.provide'

// Components
import HorizontalScroller from '~/components/Scroller/HorizontalScroller.vue'

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

export function useTableColumnResizing(props: {
  columns: TableColumn[]
  minimumColumnWidth?: number
}) {
  // Injections
  const storageKey = injectStrict(tableStorageKey)

  // Store
  const { setTableState } = useTableStore()

  const headerEl = ref<InstanceType<typeof HorizontalScroller>>()

  // Splitters (for resizing columns)
  let pageX = 0

  const activeSplitter = ref<IActiveSplitter>()

  const columnSplitters = computed(() => {
    const splitters: ISplitter[] = []

    if (!props.columns.length) {
      return splitters
    }

    let lastLeftPosition = 0

    props.columns
      .filter(col => !col.hidden)
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
    const lastCol = props.columns[props.columns.length - 1]

    if (lastCol.resizable && splitters.length) {
      splitters[splitters.length - 1].left -= 4
    }

    return splitters
  })

  function handleSplitterPointerDown(splitter: ISplitter, ev: PointerEvent) {
    const col = props.columns.find(c => c.field === splitter.field)
    const splitterCopy = klona(omit(splitter, ['column']))
    // @ts-expect-error some weird type
    const headerDom = unrefElement(headerEl)!
    const { y: headerY, height: headerHeight } =
      headerDom.getBoundingClientRect()
    const { height: tableHeight } = (
      headerDom.parentElement!.querySelector(
        '.vue-recycle-scroller'
      ) as HTMLElement
    ).getBoundingClientRect()

    pageX = ev.pageX

    activeSplitter.value = {
      ...splitterCopy,
      left: pageX,
      minLeft:
        ev.pageX - col!.adjustedWidth + (props.minimumColumnWidth || 0) - 4, // 4px is the middle of the splitter
      top: headerY,
      height: headerHeight + tableHeight,
      column: col!,
      adjustedWidth: col!.adjustedWidth,
    }

    document.documentElement.style.cursor = 'col-resize'
    document.documentElement.style.userSelect = 'none'

    document.documentElement.addEventListener(
      'pointermove',
      handleSplitterPointerMove
    )
    document.documentElement.addEventListener(
      'pointerup',
      handleSplitterPointerUp
    )
  }

  function handleSplitterPointerMove(ev: PointerEvent) {
    if (activeSplitter.value) {
      activeSplitter.value.left = Math.max(
        activeSplitter.value.minLeft!,
        ev.pageX
      )

      activeSplitter.value.adjustedWidth =
        activeSplitter.value.column.adjustedWidth +
        activeSplitter.value.left -
        pageX
    }
  }

  function handleSplitterPointerUp() {
    const diff =
      activeSplitter.value!.adjustedWidth -
      activeSplitter.value!.column.adjustedWidth

    // If the currently resized column is `semiFrozen` but not `frozen`,
    // we need to adjust the widths of all the `semiFrozen` columns that come
    // after it
    if (
      activeSplitter.value!.column.semiFrozen &&
      !activeSplitter.value!.column.frozen
    ) {
      const colIdx = props.columns.findIndex(
        col => col.field === activeSplitter.value!.column.field
      )
      const lastSemiFrozenColIdx = props.columns
        .slice(colIdx)
        .findIndex(col => !col.semiFrozen)

      const semiFrozenColumns = props.columns.slice(
        colIdx + 1,
        colIdx + lastSemiFrozenColIdx
      )

      semiFrozenColumns.forEach(col => {
        if (typeof col.headerStyle.left === 'string') {
          const left = Number(stringToFloat(col.headerStyle.left) || 0)

          col.headerStyle.left = `${left + diff}px`
        }
      })
    }

    // Set the width of the column we're resizing to the new width
    activeSplitter.value!.column.setWidth(activeSplitter.value!.adjustedWidth)

    // Reset the active splitter
    activeSplitter.value = undefined

    document.documentElement.removeEventListener(
      'pointermove',
      handleSplitterPointerMove
    )
    document.documentElement.removeEventListener(
      'pointerup',
      handleSplitterPointerUp
    )

    nextTick(() => {
      document.documentElement.style.cursor = ''
      document.documentElement.style.userSelect = ''

      setTableState(storageKey.value, { columns: props.columns })

      headerEl.value?.updateArrows()
    })
  }

  return {
    headerEl,
    activeSplitter,
    columnSplitters,
    handleSplitterPointerDown,
  }
}
