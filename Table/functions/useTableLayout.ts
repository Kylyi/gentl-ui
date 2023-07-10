// VIRTUAL SCROLLER
// @ts-expect-error - no types
import { RecycleScroller } from 'vue-virtual-scroller'

// TYPES
import type { ITableProps } from '~/components/Table/types/table-props.type'
import type { ITableState } from '~/components/Table/types/table-state.type'

// MODELS
import { TableColumn } from '~/components/Table/models/table-column.model'

// COMPOSITION FUNCTIONS
import { useTableColumns } from '~/components/Table/functions/useTableColumns'
import { useTableUtils } from '~/components/Table/functions/useTableUtils'

// COMPONENTS
import TableRow from '@/components/Table/TableRow.vue'
import TableRowMobile from '@/components/Table/TableRow.mobile.vue'
import TableHeader from '~/components/Table/TableHeader.client.vue'

// INJECTION KEYS
import { recalculateTableColumnsKey } from '~/components/Table/provide/table.provide'

export function useTableLayout(
  props: ITableProps,
  tableStateRef: Ref<ITableState>
) {
  const instance = getCurrentInstance()

  // UTILS
  const { locale } = useI18n()
  const { onOverflow } = useOverflow()
  const { resizeColumns, extendColumns } = useTableColumns(props, tableStateRef)
  const { getRowKey, hasVisibleCol } = useTableUtils()

  // LAYOUT
  const scrollerEl = ref<InstanceType<typeof RecycleScroller>>()
  const tableEl = ref<HTMLDivElement>()
  const headerEl = ref<InstanceType<typeof TableHeader>>()
  const containerEl = ref<HTMLDivElement>()

  const rowKey = computedEager(() => getRowKey(props))

  const hasVisibleColumn = computed(() => hasVisibleCol(internalColumns.value))

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
  const columns = toRef(props, 'columns')
  const internalColumns = ref<TableColumn[]>(extendColumns(props.columns))
  // const internalColumns = ref<TableColumn[]>(
  //   extendColumns(props.columns.map(col => new TableColumn(col)))
  // )

  // When locale is changed, we need to sync the labels of the columns
  function syncColumnLabels() {
    props.columns.forEach(col => {
      const internalCol = internalColumns.value.find(c => c.field === col.field)
      if (internalCol) {
        internalCol.label = col.label
        internalCol.format = col.format
      }
    })
  }

  // RESIZE & SCROLLING
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

  onOverflow(
    containerEl,
    _isOverflown => {
      isOverflown.value = _isOverflown as boolean

      handleResize(true)
    },
    { direction: 'vertical' }
  )

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

  provide(recalculateTableColumnsKey, throttledHandleResize)

  onMounted(() => {
    const selfDom = instance?.vnode.el as HTMLElement

    containerEl.value = selfDom.querySelector(
      '.vue-recycle-scroller'
    ) as HTMLDivElement
  })

  watch(locale, () => {
    nextTick(() => syncColumnLabels())
  })

  return {
    columns,
    isScrolled,
    isOverflown,
    TableRowComponent,
    rowKey,
    handleScrollLeft: (left: number) => (scrollLeft.value = left),

    // ELEMENT REFS
    scrollerEl,
    tableEl,
    headerEl,
    containerEl,

    // COLUMNS
    internalColumns,
    searchableColumnLabels,
    hasVisibleColumn,

    // FUNCTIONS
    handleRowClick,
    throttledHandleResize,
  }
}
