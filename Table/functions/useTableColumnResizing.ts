import { klona } from 'klona'

// MODELS
import { TableColumn } from '~/components/Table/models/table-column.model'

// COMPOSITION FUNCTIONS
import { useTableUtils } from '~/components/Table/functions/useTableUtils'

// COMPONENTS
import HorizontalScroller from '@/components/Scroller/HorizontalScroller.vue'

type ISplitter = {
  field: TableColumn['field']
  left: number
}

type IActiveSplitter = ISplitter & {
  minLeft: number // ~ when dragging, it cannot go lower than this
  top: number
  height: number
  column: TableColumn
  adjustedWidth: number
}

export function useTableColumnResizing(props: {
  columns: TableColumn<any>[]
  minimumColumnWidth?: number
}) {
  const updateTableState = injectStrict(updateTableStateKey)

  // UTILS
  const { stripColumnsStateData } = useTableUtils()

  const headerEl = ref<InstanceType<typeof HorizontalScroller>>()

  // SPLITTERS (for resizing columns)
  let pageX = 0

  const activeSplitter = ref<IActiveSplitter>()

  const columnSplitters = computed(() => {
    const splitters: ISplitter[] = []
    let lastLeftPosition = 0

    props.columns.forEach(col => {
      lastLeftPosition += col.adjustedWidth

      if (col.isHelperCol) {
        return
      }

      splitters.push({
        field: col.field as string,
        left: lastLeftPosition,
      })
    })

    return splitters.slice(0, -1)
  })

  function handleSplitterPointerDown(splitter: ISplitter, ev: PointerEvent) {
    const col = props.columns.find(c => c.field === splitter.field)
    const splitterCopy = klona(splitter)
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
    // Once we start changing the width of a column, we need to set width of the
    // other columns to a fixed value so it doesn't jump around
    props.columns.forEach(col => col.setWidth(col.adjustedWidth))

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

      updateTableState({
        columns: stripColumnsStateData(props.columns),
      })
    })
  }

  return {
    headerEl,
    activeSplitter,
    columnSplitters,
    handleSplitterPointerDown,
  }
}
