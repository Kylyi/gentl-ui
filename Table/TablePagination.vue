<script setup lang="ts">
import { config } from '~/config'

type IProps = {
  currentPage: number
  currentPageSize: number
  isFirstPage: boolean
  isLastPage: boolean
  noPagination?: boolean
  pageCount: number
  totalRows?: number
  currentRows?: number
  infiniteScroll?: boolean

  prev: () => void
  next: () => void
}

const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'update:currentPage', page: number): void
  (e: 'update:currentPageSize', page: number): void
}>()

// Layout
const currentPage = useVModel(props, 'currentPage', emits)
const currentPageSize = useVModel(props, 'currentPageSize', emits)

const pages = computedEager(() => {
  // Less than 5 pages
  if (props.pageCount <= 5) {
    return Array.from({ length: props.pageCount }, (_, i) => i + 1)
  }

  // We are currently on the first or second page
  // -> [1, 2, 3, ..., pageCount]
  else if (props.isFirstPage || props.currentPage === 1) {
    return [1, 2, 3, Number.POSITIVE_INFINITY, props.pageCount]
  }

  // We are currently on the last or second to last page
  // -> [1, ..., pageCount - 2, pageCount - 1, pageCount]
  else if (props.isLastPage || props.currentPage === props.pageCount - 1) {
    return [
      1,
      Number.POSITIVE_INFINITY,
      props.pageCount - 2,
      props.pageCount - 1,
      props.pageCount,
    ]
  }

  // We are currently on some page in between
  // -> [currentPage - 1, currentPage, currentPage + 1, ..., pageCount]
  else {
    return [
      props.currentPage - 1,
      props.currentPage,
      props.currentPage + 1,
      Number.POSITIVE_INFINITY,
      props.pageCount,
    ]
  }
})

const isLimitRowsReached = computedEager(() => {
  const limitRows = config.table.limitRows
  const currentRows = props.currentRows || 0
  const totalRows = props.totalRows || 0

  return (
    config.table.limitRows && currentRows >= limitRows && totalRows > limitRows
  )
})
</script>

<template>
  <ClientOnly>
    <div class="table-pagination">
      <!-- Total rows -->
      <div
        absolute
        left-2
        :class="{ 'lt-md:display-none': !noPagination }"
        flex="~ gap-x-2 center"
      >
        <span
          v-if="currentRows"
          text="caption"
        >
          <template v-if="infiniteScroll">
            <span font="bold">{{ currentRows }}</span>
            {{ $t('general.outOf') }}
            <span font="bold">{{ totalRows }}</span>
            {{ $t('general.row', totalRows || 0) }}
          </template>

          <template v-else>
            <span font="bold">
              {{ (currentPage - 1) * currentPageSize }} -
              {{ (currentPage - 1) * currentPageSize + currentRows }}
            </span>
            {{ $t('general.outOf') }}
            <span font="bold">{{ totalRows }}</span>
            {{ $t('general.row', totalRows || 0) }}
          </template>
        </span>

        <span
          v-else
          text="caption"
        >
          {{ $t('table.totalRows') }}:
          {{ totalRows }}
        </span>
      </div>

      <!-- Limit amount of rows reached -->
      <template v-if="isLimitRowsReached">
        <div
          flex="~ gap-2 items-center"
          text="caption"
        >
          <div class="color-blue-500 bi:info-lg" />
          <span>{{ $t('table.limitRowsReached') }}</span>

          <Tooltip
            placement="top"
            w="120"
            :offset="8"
            text="center"
          >
            {{ $t('table.limitRowsReachedTooltip') }}
          </Tooltip>
        </div>
      </template>

      <template v-else-if="pages.length > 1 && !noPagination">
        <!-- First page -->
        <Btn
          :disabled="isFirstPage"
          size="sm"
          disable-style="flat"
          icon="line-md:chevron-small-double-right rotate-180"
          @click="currentPage = 1"
        />

        <!-- Previous page -->
        <Btn
          :disabled="isFirstPage"
          size="sm"
          disable-style="flat"
          icon="material-symbols:chevron-right-rounded rotate-180"
          @click="prev"
        />

        <!-- Pages -->
        <template
          v-for="(page, idx) in pages"
          :key="idx"
        >
          <Btn
            v-if="page !== Infinity"
            size="sm"
            :label="page"
            :class="{ 'is-active': page === currentPage }"
            @click="currentPage = page"
          />
          <div v-else>...</div>
        </template>

        <!-- Next page -->
        <Btn
          :disabled="isLastPage"
          size="sm"
          icon="material-symbols:chevron-right-rounded"
          @click="next"
        />

        <!-- Last page -->
        <Btn
          :disabled="isLastPage"
          size="sm"
          disable-style="flat"
          icon="line-md:chevron-small-double-right"
          @click="currentPage = pageCount"
        />
      </template>

      <!-- Page size -->
      <div
        v-if="!noPagination"
        absolute
        right-2
        display="!lt-md:none"
        flex="~ gap-x-2 center"
      >
        <span text="caption">
          {{ $t('table.rowsPerPage') }}
        </span>

        <Selector
          v-model="currentPageSize"
          :options="[5, 10, 25, 50, 100]"
          emit-key
          size="sm"
          no-search
          w="17"
          append-class="!p-x-1"
          inner-class="!p-l-2 !p-r-2px"
        />
      </div>
    </div>
  </ClientOnly>
</template>

<style scoped lang="scss">
.table-pagination {
  --apply: relative flex flex-center flex-gap-x-1 p-y-1 min-h-10;

  .btn.is-active {
    --apply: bg-primary color-white;
  }
}
</style>
