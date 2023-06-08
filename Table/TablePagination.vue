<script setup lang="ts">
type IProps = {
  currentPage: number
  isFirstPage: boolean
  isLastPage: boolean
  pageCount: number

  prev: () => void
  next: () => void
}

const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'update:currentPage', page: number): void
}>()

// LAYOUT
const currentPage = useVModel(props, 'currentPage', emits)

const pages = computedEager(() => {
  // Less than 5 pages
  if (props.pageCount <= 5) {
    return Array.from({ length: props.pageCount }, (_, i) => i + 1)
  }

  // We are currently on the first or second page
  // -> [1, 2, 3, ..., pageCount]
  else if (props.isFirstPage || props.currentPage === 1) {
    return [1, 2, 3, Infinity, props.pageCount]
  }

  // We are currently on the last or second to last page
  // -> [1, ..., pageCount - 2, pageCount - 1, pageCount]
  else if (props.isLastPage || props.currentPage === props.pageCount - 1) {
    return [
      1,
      Infinity,
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
      Infinity,
      props.pageCount,
    ]
  }
})
</script>

<template>
  <ClientOnly>
    <div
      v-if="pages.length > 1"
      class="table-navigation"
    >
      <!-- FIRST BTN -->
      <Btn
        :disabled="isFirstPage"
        size="sm"
        disable-style="flat"
        icon="line-md:chevron-small-double-right rotate-180"
        @click="currentPage = 1"
      />

      <!-- PREVIOUS BTN -->
      <Btn
        :disabled="isFirstPage"
        size="sm"
        disable-style="flat"
        icon="material-symbols:chevron-right-rounded rotate-180"
        @click="prev"
      />

      <!-- PAGES -->
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

      <!-- NEXT BTN -->
      <Btn
        :disabled="isLastPage"
        size="sm"
        icon="material-symbols:chevron-right-rounded"
        @click="next"
      />

      <!-- LAST BTN -->
      <Btn
        :disabled="isLastPage"
        size="sm"
        disable-style="flat"
        icon="line-md:chevron-small-double-right"
        @click="currentPage = pageCount"
      />
    </div>

    <template #fallback>
      <Skeleton
        h="10"
        w="full"
        rounded="custom"
      />
      <Skeleton
        h="10"
        w="full"
        rounded="custom"
      />
      <Skeleton
        h="10"
        w="full"
        rounded="custom"
      />
    </template>
  </ClientOnly>
</template>

<style scoped lang="scss">
.table-navigation {
  --apply: flex flex-center flex-gap-x-1 p-y-1;

  .is-active {
    --apply: bg-primary color-white;
  }
}
</style>
