// Virtual scroller
// @ts-expect-error - no types
import { RecycleScroller } from 'vue-virtual-scroller'

// Types
import type { ITableProps } from '~/components/Table/types/table-props.type'
import type { ITableLayout } from '~/components/Table/types/table-layout.type'

// Models
import { TableColumn } from 'components/Table/models/table-column.model'

// Injections
import { tableResizeKey } from '~/components/Table/provide/table.provide'

// Functions
import { useTableColumns } from '~/components/Table/functions/useTableColumns'
import { useTableUtils } from '~/components/Table/functions/useTableUtils'

// Components
import TableRow from '~/components/Table/TableRow.vue'
import TableRowMobile from '~/components/Table/TableRow.mobile.vue'
import TableHeader from '~/components/Table/TableHeader.client.vue'

export function useTableLayout(
  props: ITableProps,
  columnsRef: Ref<TableColumn[]>,
  layoutRef: Ref<ITableLayout | undefined>
) {
  const instance = getCurrentInstance()

  // Utils
  const { onOverflow } = useOverflow()
  const { getRowKey } = useTableUtils()
  const {
    hasVisibleColumn,
    internalColumns,
    searchableColumnLabels,
    resizeColumns,
    recreateColumns,
  } = useTableColumns(props, columnsRef, layoutRef)

  // Provides
  provide(tableResizeKey, () => handleResize(true))

  // Layout
  const scrollerEl = ref<InstanceType<typeof RecycleScroller>>()
  const tableEl = ref<HTMLDivElement>()
  const headerEl = ref<InstanceType<typeof TableHeader>>()
  const containerEl = ref<HTMLDivElement>()

  const rowKey = computedEager(() => getRowKey(props))

  function handleRowClick(row: any, event: Event) {
    const rowEl = event.target as HTMLElement

    if (props.rowClickable) {
      instance?.emit('row-click', { row, el: rowEl.closest('.tr')! })
    }
  }

  // CSS variables
  const rowHeight = useCssVar('--rowHeight', tableEl)
  const mobileRowHeight = useCssVar('--mobileRowHeight', tableEl)
  const rowHeaderHeight = useCssVar('--headerHeight', tableEl)

  watchEffect(() => {
    rowHeight.value = `${props.rowHeight}px`
    mobileRowHeight.value = `${props.mobileRowHeight}px`
    rowHeaderHeight.value = `${props.headerHeight || props.rowHeight}px`
  })

  // Resize & scrolling
  const isScrolled = ref(false)
  const isOverflown = ref(false)
  let containerWidth = 0

  function handleResize(force?: boolean) {
    const { width } = scrollerEl.value.$el.getBoundingClientRect()

    if (
      scrollerEl.value &&
      tableEl.value &&
      (width !== containerWidth || force)
    ) {
      internalColumns.value = resizeColumns(
        tableEl.value,
        scrollerEl.value.$el,
        internalColumns.value,
        {
          groupsRef: [],
          isSelectableRef: props.selectable,
          groupExpandWidthRef: props.groupExpandWidth,
          minColWidthRef: props.minimumColumnWidth,
        }
      )
      containerWidth = width
    }
  }

  // Detect overflow
  // On overflow, we recaulculate the columns
  onOverflow(
    containerEl,
    _isOverflown => {
      isOverflown.value = _isOverflown as boolean

      handleResize(true)
    },
    { direction: 'vertical' }
  )

  // Sync scrolling between header and body
  const { x: scrollLeft } = useScroll(containerEl, {
    onScroll: ev => {
      const el = ev.target as HTMLDivElement
      headerEl.value?.syncScroll(el.scrollLeft)
      isScrolled.value = el.scrollTop !== 0
    },
  })

  const throttledHandleResize = useThrottleFn(
    (force?: boolean) => {
      handleResize(force)
    },
    250,
    true,
    false
  )

  // Responsivity
  const isBreakpoint = toRef($bp, props.breakpoint || 'md')

  const tableRowHeight = computed(() => {
    if (isBreakpoint.value) {
      return props.rowHeight
    }

    const visibleColumns = internalColumns.value.filter(
      column => !column.hidden
    )

    const MOBILE_ROW_Y_PADDING = 2 * (12 + 1) // + 1 is border
    const MOBILE_ROW_CONTAINER_Y_PADDING = 2 * 4
    const columnsHeight =
      visibleColumns.length *
      (props.mobileRowHeight || props.mobileRowHeight || 40)

    return columnsHeight + MOBILE_ROW_Y_PADDING + MOBILE_ROW_CONTAINER_Y_PADDING
  })

  const TableRowComponent = computed(() => {
    return isBreakpoint.value ? TableRow : TableRowMobile
  })

  onMounted(() => {
    const selfDom = instance?.vnode.el as HTMLElement

    containerEl.value = selfDom.querySelector(
      '.vue-recycle-scroller'
    ) as HTMLDivElement
  })

  return {
    isScrolled,
    isOverflown,
    tableRowHeight,
    TableRowComponent,
    rowKey,
    handleScrollLeft: (left: number) => (scrollLeft.value = left),

    // Element refs
    scrollerEl,
    tableEl,
    headerEl,
    containerEl,

    // Columns
    internalColumns,
    searchableColumnLabels,
    hasVisibleColumn,

    // Functions
    handleRowClick,
    throttledHandleResize,
    recreateColumns,
    handleResize,
  }
}
