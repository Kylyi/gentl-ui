<script setup lang="ts">
import { type VirtualItem, useVirtualizer } from '@tanstack/vue-virtual'

// Types
import type { IVirtualScrollEvent } from '~/components/VirtualScroller/types/virtual-scroll-event.type'

type IProps = {
  /**
   * When true, each row may have a different height
   */
  dynamicRowHeight?: boolean

  /**
   * When true, the component will NOT emit scroll events (performance)
   */
  noScrollEmit?: boolean

  /**
   * The number of items to overscan for virtualization
   */
  overscan?: number

  /**
   * The data rows
   */
  rows?: any[]

  /**
   * The height of each row
   */
  rowHeight?: number

  /**
   * The key to use for each row
   */
  rowKey?: string | number
}

const props = withDefaults(defineProps<IProps>(), {
  rowHeight: 40,
  rowKey: 'id',
  overscan: 100,
})

const emits = defineEmits<{
  (e: 'virtual-scroll', payload: IVirtualScrollEvent): void
}>()

defineExpose({
  scrollToTop: () => virtualScroll.value.scrollToIndex(0),
  scrollTo: (idx: number) => virtualScroll.value.scrollToIndex(idx),
  focus: () => containerEl.value?.focus(),
  apply: (fnc: (instance: typeof virtualScroll.value) => void) => {
    fnc(virtualScroll.value)
  },
})

// Utils
const virtualScrollOptions = computed(() => {
  const rows = props.rows
  const rowHeight = props.rowHeight

  return {
    count: rows?.length ?? 0,
    estimateSize: () => rowHeight,
    getScrollElement: () => containerEl.value!,
    getItemKey: () => props.rowKey,
    overscan: props.overscan,

    ...(!props.noScrollEmit && {
      onChange: (instance: any): void => {
        if (!props.rows?.length) {
          return
        }

        const visibleStartItem = instance.getVirtualItemForOffset(
          instance.scrollOffset
        )
        const visibleEndItem = instance.getVirtualItemForOffset(
          instance.scrollOffset + instance.scrollRect.height
        )

        emits('virtual-scroll', { visibleStartItem, visibleEndItem })
      },
    }),
  }
})

// Layout
const rows = toRef(props, 'rows')
const containerEl = ref<HTMLDivElement>()
const virtualScroll = useVirtualizer(virtualScrollOptions)

const virtualRows = computed(() => virtualScroll.value.getVirtualItems())
const totalSize = computed(() => virtualScroll.value.getTotalSize())

// Measuring
function measureElement(node: any, row: VirtualItem) {
  const el = 'el' in node ? node.el : node

  if (!el) {
    return undefined
  }

  virtualScroll.value.measureElement(el)
}
</script>

<template>
  <div
    ref="containerEl"
    class="virtual-scroll"
    tabindex="0"
  >
    <!-- Static row height -->
    <div
      v-if="!dynamicRowHeight"
      class="virtual-scroll__content"
      :style="{ height: `${totalSize}px` }"
    >
      <div
        v-for="virtualRow in virtualRows"
        :key="virtualRow.index"
        class="virtual-scroll__content-row"
        :class="virtualRow.index % 2 ? 'is-odd' : 'is-even'"
        :style="{
          height: `${virtualRow.size}px`,
          transform: `translateY(${virtualRow.start}px)`,
        }"
      >
        <slot
          :row="rows?.[virtualRow.index]"
          :index="virtualRow.index"
        >
          Row {{ virtualRow.index }}
        </slot>
      </div>
    </div>

    <!-- Dynamic row height -->
    <!-- <div
      v-else
      class="virtual-scroll__content"
      :style="{ height: `${totalSize}px` }"
    >
      <div
        class="virtual-scroll__content-dynamic"
        :style="{
          transform: `translateY(${virtualRows[0]?.start ?? 0}px)`,
        }"
      >
        <div
          v-for="virtualRow in virtualRows"
          :key="virtualRow.index"
          :data-index="virtualRow.index"
          :class="virtualRow.index % 2 ? 'is-odd' : 'is-even'"
          @vue:mounted="measureElement($event, virtualRow)"
        >
          <slot
            :row="rows?.[virtualRow.index]"
            :index="virtualRow.index"
          >
            Row {{ virtualRow.index }}
          </slot>
        </div>
      </div>
    </div> -->

    <div
      v-else
      class="virtual-scroll__content"
    >
      <div
        v-for="(row, idx) in rows"
        :key="row[rowKey]"
        :class="idx % 2 ? 'is-odd' : 'is-even'"
        class="w-full flex"
      >
        <slot
          :row="row"
          :index="idx"
        >
          Row {{ idx }}
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.virtual-scroll {
  --apply: overflow-auto grow outline-none;

  &__content {
    --apply: w-full relative;

    &-row {
      --apply: flex w-full absolute top-0 left-0;
    }

    &-dynamic {
      --apply: w-full absolute top-0 left-0;
    }
  }
}
</style>
