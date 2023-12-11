<script setup lang="ts">
import { config } from '~/config'

// Types
import type { IListProps } from '~/components/List/types/list-props.type'
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
  fuseExtendedSearchToken: config.selector.fuseExtendedSearchToken,
})

defineEmits<{
  (e: 'update:items', items: any[]): void
  (e: 'update:selected', item: any): void
  (e: 'update:addedItems', items: IItemToBeAdded[]): void
  (e: 'added', item: any): void
  (e: 'added-multiple', items: any[]): void
  (e: 'removed', item: any): void
  (e: 'search', payload: { hasExactMatch: boolean; search: string }): void
}>()

// Layout
const containerEl = ref<InstanceType<typeof ListVirtualContainer>>()
const items =
  props.items !== undefined
    ? (useVModel(props, 'items') as Ref<any>)
    : ref<any[]>([])

const ContainerComponent = computed(() => {
  return props.virtual || items.value.length >= 1e3
    ? ListVirtualContainer
    : ListContainer
})

const {
  arr,
  isLoading,
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

defineExpose({
  handleSelectItem: (option: any) => handleSelectItem(option),
  clearSearch: () => {
    searchEl.value?.clear()
    search.value = ''
  },
  loadData,
  refresh,
  handleKey,
})

// When `noSearch` is used, we fake the focus on the container to allow
// keyboard navigation
onMounted(() => {
  if (props.noSearch) {
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
          class="bg-white dark:bg-darker"
          :autofocus="!noAutofocus"
          data-cy="list-search"
        />

        <slot name="after-search" />
      </div>

      <!-- Separator -->
      <div
        v-if="!dense"
        class="separator"
      />
    </template>

    <!-- Loading -->
    <div
      v-if="loading || isLoading"
      flex="~ center"
    >
      <LoaderInline />
    </div>

    <Btn
      v-if="allowSelectAllFiltered && search"
      :label="$t('selectFiltered')"
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
      tabindex="0"
      data-cy="search-results"
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
      v-else
      icon-center
      :label="$t('general.noData')"
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

.no-data {
  --apply: flex italic color-ca text-caption p-t-2 p-x-3;
}

.selector {
  .no-data {
    --apply: p-x-3;
  }
}
</style>
