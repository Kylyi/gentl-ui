<script setup lang="ts">
import { config } from '~/components/config/components-config'

// Types
import type { IListProps } from '~/components/List/types/list-props.type'
import type { IListFetchOptions } from '~/components/List/types/list-fetch.type'
import type { IItemToBeAdded } from '~/components/List/types/list-item-to-add.type'

// Functions
import { useList } from '~/components/List/functions/useList'

// Components
import ListVirtualContainer from '~/components/List/ListVirtualContainer.vue'
import ListContainer from '~/components/List/ListContainer.vue'

const props = withDefaults(defineProps<IListProps>(), {
  clearable: true,
  disabledFnc: () => false,
  emptyValue: null,
  groupBy: () => [],
  itemKey: 'id',
  itemLabel: 'label',
  fuseExtendedSearchToken: config.selector.props.fuseExtendedSearchToken,
  useToBoldLatin: undefined,
})

defineEmits<{
  (e: 'update:items', items: any[]): void
  (e: 'update:selected', item: any): void
  (e: 'update:addedItems', items: IItemToBeAdded[]): void
  (e: 'added', item: any): void
  (e: 'added-multiple', items: any[]): void
  (e: 'removed', item: any): void
  (e: 'search', payload: { hasExactMatch: boolean; search: string }): void
  (
    e: 'before-search',
    payload: { hasExactMatch: boolean; search: string }
  ): void
}>()

// Layout
const containerEl = ref<InstanceType<typeof ListVirtualContainer>>()
const items =
  props.items !== undefined
    ? (useVModel(props, 'items') as Ref<any>)
    : ref<any[]>([])

const ContainerComponent = computed(() => {
  return ListContainer

  // return props.virtual || items.value.length >= 1e3
  //   ? ListVirtualContainer
  //   : ListContainer
})

defineExpose({
  handleSelectItem: (option: any) => handleSelectItem(option),
  clearSearch: () => {
    searchEl.value?.clear()
    search.value = ''
  },
  loadData: (search?: string, options?: IListFetchOptions) =>
    loadData(search, options),
  refresh: () => refresh(),
  handleKey: (
    ev: KeyboardEvent,
    options?: { force?: boolean; repeated?: boolean }
  ) => handleKey(ev, options),
})

const {
  arr,
  isLoading,
  isInitialized,
  hoveredIdx,
  listEl,
  listRowProps,
  search,
  searchEl,
  selectedByKey,
  handleKey,
  handleMouseOver,
  handleSelectFiltered,
  handleSelectItem,
  loadData,
  refresh,
} = useList(items, props, containerEl)

// When `noSearch` is used, we fake the focus on the container to allow
// keyboard navigation
onMounted(() => {
  if (props.noSearch && !props.noAutofocus) {
    setTimeout(() => {
      unrefElement(containerEl)?.focus()
    }, 150)
  }
})
</script>

<template>
  <div
    ref="listEl"
    class="list"
    :class="{ 'is-bordered': bordered }"
  >
    <!-- Search -->
    <template v-if="!noSearch">
      <div class="list-search">
        <SearchInput
          ref="searchEl"
          v-model="search"
          :class="{ 'm-2': !dense }"
          grow
          :debounce="searchDebounce"
          layout="regular"
          class="bg-white dark:bg-darker"
          :loading="isLoading"
          :autofocus="!noAutofocus"
          data-cy="list-search"
          v-bind="inputProps"
        />

        <slot name="after-search" />
      </div>

      <!-- Separator -->
      <div
        v-if="!dense"
        class="separator"
      />
    </template>

    <Btn
      v-if="allowSelectAllFiltered && search"
      :label="$t('general.selectFiltered')"
      no-uppercase
      m="x-1 y-2"
      :disabled="loading"
      @click="handleSelectFiltered"
    />

    <slot
      name="above"
      :items-filtered="arr"
    />

    <Component
      :is="ContainerComponent"
      v-if="arr.length"
      ref="containerEl"
      :items="arr"
      :class="contentClass"
      :tabindex="noSearch ? 0 : undefined"
      :has-infinite-scroll="hasInfiniteScroll"
      data-cy="search-results"
      @infinite-scroll="loadData(search, { fetchMore: true })"
    >
      <template #default="{ item, index }">
        <ListRow
          :item="item"
          :tag="rowTag"
          :is-selected="!('isGroup' in item) && !!selectedByKey[item.id]"
          :is-hovered="hoveredIdx === index"
          :is-disabled="disabledFnc(item)"
          v-bind="listRowProps"
          :row-height="'isGroup' in item ? rowGroupHeight : rowHeight"
          @mouseover="handleMouseOver(item, index)"
          @click="handleSelectItem(item)"
        >
          <template #default="{ option }">
            <slot
              v-if="!option.isGroup"
              name="option"
              :item="option.ref"
              :highlighted="option._highlighted"
              :index="index"
            />

            <slot
              v-else
              name="option-group"
              :item="option"
            />
          </template>
        </ListRow>
      </template>
    </Component>

    <Banner
      v-else-if="!isLoading && isInitialized"
      icon-center
      :label="$t('general.noData')"
    />

    <LoaderBlock
      v-else-if="!isInitialized"
      size="xl"
      self-center
      m="y-4"
    />

    <slot name="below" />
  </div>
</template>

<style lang="scss" scoped>
.list {
  --apply: flex flex-col overflow-auto;

  &.is-bordered {
    --apply: border-1 border-ca rounded-3;
  }

  &-search {
    --apply: flex w-full shrink-0 overflow-auto bg-ca;
  }
}

.separator {
  --apply: border-b-1 border-ca;
}

[placement^='top'] {
  .list-search {
    --apply: order-2;
  }

  .separator {
    --apply: order-1;
  }
}

.list-search {
  --apply: flex-wrap;
}

.no-data {
  --apply: flex italic color-ca text-caption p-t-2 p-x-3;
}

.selector {
  .no-data {
    --apply: p-x-3;
  }
}
</style>
