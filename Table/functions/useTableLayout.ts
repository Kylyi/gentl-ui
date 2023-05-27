// VIRTUAL SCROLLER
// @ts-expect-error - no types
import { RecycleScroller } from 'vue-virtual-scroller'

// TYPES
import type { ITableProps } from '~/components/Table/types/table-props.type'

// COMPOSITION FUNCTIONS
import { useTableColumns } from '~/components/Table/functions/useTableColumns'

// COMPONENTS
import TableRow from '@/components/Table/TableRow.vue'
import TableRowMobile from '@/components/Table/TableRow.mobile.vue'
import TableHeader from '~/components/Table/TableHeader.vue'
import { TableColumn } from '~/components/Table/models/table-column.model'

export function useTableLayout(props: ITableProps) {
  const instance = getCurrentInstance()

  // UTILS
  const { onOverflow } = useOverflow()
  const { resizeColumns } = useTableColumns()

  // LAYOUT
  const scrollerEl = ref<InstanceType<typeof RecycleScroller>>()
  const tableEl = ref<HTMLDivElement>()
  const headerEl = ref<InstanceType<typeof TableHeader>>()
  const containerEl = ref<HTMLDivElement>()

  const rowKey = computedEager(() => {
    if (props.getData?.createIdentifier) {
      return '_uuid'
    }

    return props.rowKey || 'id'
  })

  const searchableColumnLabels = computed(() => {
    return props.columns.filter(col => col.searchable).map(col => col._label)
  })

  function handleRowClick(row: any, event: Event) {
    const rowEl = event.target as HTMLElement

    if (props.rowClickable) {
      instance?.emit('row-click', { row, el: rowEl.closest('.tr')! })
    }
  }

  // CSS VARS
  const rowHeight = useCssVar('--rowHeight', tableEl)
  const mobileRowHeight = useCssVar('--mobileRowHeight', tableEl)
  const rowHeaderHeight = useCssVar('--headerHeight', tableEl)

  watchEffect(() => {
    rowHeight.value = `${props.rowHeight}px`
    mobileRowHeight.value = `${props.mobileRowHeight}px`
    rowHeaderHeight.value = `${props.headerHeight || props.rowHeight}px`
  })

  // COLUMNS
  const internalColumns = ref<TableColumn[]>([])

  // RESIZE & SCROLLING
  const isScrolled = ref(false)
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
        props.columns,
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

  onOverflow(containerEl, () => handleResize(true), { direction: 'vertical' })

  useScroll(containerEl, {
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

  // RESPONSIVITY
  const isBreakpoint = toRef($bp, props.breakpoint || 'md')

  const TableRowComponent = computed(() => {
    return isBreakpoint.value ? TableRow : TableRowMobile
  })

  // TODO: Row splitting
  // ROW SPLITTING ~ Multiple column rows
  // const splitRows = ref<Array<IGroupRow | IItem<any>[]>>([])

  // function splitRows() {

  // }

  onMounted(() => {
    containerEl.value = document.querySelector(
      '.vue-recycle-scroller'
    ) as HTMLDivElement
  })

  return {
    isScrolled,
    TableRowComponent,
    rowKey,

    // ELEMENT REFS
    scrollerEl,
    tableEl,
    headerEl,
    containerEl,

    // COLUMNS
    internalColumns,
    searchableColumnLabels,

    // FUNCTIONS
    handleRowClick,
    throttledHandleResize,
  }
}
