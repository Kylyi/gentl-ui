<script setup lang="ts">
import { useVirtualizer } from '@tanstack/vue-virtual'

// Types
import type { IVirtualScrollEvent } from '~/components/VirtualScroller/types/virtual-scroll-event.type'

type IProps = {
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
  const rowHeight = props.rowHeight

  return {
    count: props.rows?.length ?? 0,
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
const containerEl = ref<HTMLDivElement>()
const virtualScroll = useVirtualizer(virtualScrollOptions)

const virtualRows = computed(() => virtualScroll.value.getVirtualItems())
const totalSize = computed(() => virtualScroll.value.getTotalSize())
</script>

<template>
  <div
    ref="containerEl"
    class="virtual-scroll"
    tabindex="0"
  >
    <div
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
  </div>
</template>

<style scoped lang="scss">
.virtual-scroll {
  --apply: overflow-auto grow rounded-custom outline-blue-500 outline-offset-4;

  &__content {
    --apply: w-full relative;

    &-row {
      --apply: flex w-full absolute top-0 left-0;
    }
  }
}
</style>
