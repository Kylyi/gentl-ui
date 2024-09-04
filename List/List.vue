<script setup lang="ts">
import { config } from '~/components/config/components-config'

// Types
import type { IListProps } from '~/components/List/types/list-props.type'
import type { IListFetchOptions } from '~/components/List/types/list-fetch.type'
import type { IItemToBeAdded } from '~/components/List/types/list-item-to-add.type'
import type { IListDraggedItem } from '~/components/List/types/list-dragged-item.type'

// Functions
import { useList } from '~/components/List/functions/useList'
import { useListUtils } from '~/components/List/functions/useListUtils'

// Injections
import { listContainerKey } from '~/components/List/provide/list.provide'
import { useListDragAndDrop } from '~/components/List/functions/useListDragAndDrop'

// Components
import type ListVirtualContainer from '~/components/List/ListVirtualContainer.vue'
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
  (e: 'search', payload: { hasExactMatch: boolean, search: string }): void
  (e: 'before-search', payload: { hasExactMatch: boolean, search: string }): void
  (e: 'update:search', val?: string | undefined | null): void
  (e: 'drag:start', item: IListDraggedItem): void
  (e: 'drag:end', item: IListDraggedItem): void
  (e: 'submit', item: any): void
}>()

// Utils
const { handleMoveItem, handleMoveItems } = useListUtils()

// Layout
const containerEl = ref<InstanceType<typeof ListVirtualContainer>>()
const items = props.items !== undefined
  ? (useVModel(props, 'items') as Ref<any[]>)
  : ref<any[]>([])

const ContainerComponent = computed(() => {
  return ListContainer

  // return props.virtual || items.value.length >= 1e3
  //   ? ListVirtualContainer
  //   : ListContainer
})

const scrollContainer = computed(() => containerEl.value?.getElement())

provide(listContainerKey, scrollContainer)

defineExpose({
  handleSelectItem: (option: any) => handleSelectItem(option),
  clearSearch: () => {
    searchEl.value?.clear()
    search.value = ''
  },
  loadData: (search?: string, options?: IListFetchOptions) => loadData(search, options),
  refresh: () => refresh(),
  handleKey: (
    ev: KeyboardEvent,
    options?: { force?: boolean, repeated?: boolean },
  ) => handleKey(ev, options),
  moveItem: handleMoveListItemById,
  moveItems: handleMoveListItemsById,
  getListItems: () => items,
  resetAddedItems: () => resetAddedItems(),
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
  searchInputValidation,
  isSelected,
  handleKey,
  handleMouseOver,
  handleSelectFiltered,
  handleSelectItem,
  loadData,
  refresh,
  resetAddedItems,
} = useList(items, props, containerEl)

// D'n'D
const { draggedItem, listElRect } = useListDragAndDrop(listEl as Ref<HTMLDivElement>)

useResizeObserver(listEl, entries => {
  listElRect.value = listEl.value?.getBoundingClientRect()
})

// Move item(s)
function handleMoveListItemById(payload: {
  id: string | number
  targetId: string | number
  direction: 'above' | 'below'
}) {
  handleMoveItem({ itemsRef: items, ...payload })
}

function handleMoveListItemsById(
  payload: {
    ids: Array<string | number>
    targetId: string | number
    direction: 'above' | 'below'
  },
) {
  handleMoveItems({ itemsRef: items, ...payload })
}

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
          layout="regular"
          class="bg-white dark:bg-darker"
          :loading="isLoading"
          :autofocus="!noAutofocus"
          data-cy="list-search"
          v-bind="inputProps"
          :validation="searchInputValidation"
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
          :item
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
              :is-selected="isSelected(option.ref)"
            />

            <slot
              v-else
              name="option-group"
              :item="option"
              :idx="index"
            />
          </template>
        </ListRow>
      </template>
    </Component>

    <!-- No data -->
    <div
      v-else-if="!isLoading && isInitialized"
      flex="~ 1 col"
    >
      <Banner
        icon-center
        :label="$t('general.noData')"
      />
    </div>

    <LoaderBlock
      v-else-if="!isInitialized"
      size="xl"
      self-center
      m="y-4"
    />

    <slot name="below" />

    <!-- Drop indicator -->
    <div
      v-if="draggedItem?.dropIndicatorPos"
      class="drop-indicator"
      :style="{
        left: `${draggedItem.dropIndicatorPos.x ?? 0}px`,
        top: `${draggedItem.dropIndicatorPos.y ?? 0}px`,
        width: `${draggedItem.dropIndicatorPos.width ?? 0}px`,
      }"
    >
      <div
        class="drop-indicator__icon"
        :class="{
          'rotate-y-180 -top-3': draggedItem.direction === 'below',
          'rotate-180 -top-7px': draggedItem.direction === 'above',
        }"
      >
        <div i-tabler:arrow-back />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.list {
  @apply relative flex flex-col overflow-auto;

  &.is-bordered {
    @apply border-1 border-ca rounded-3;
  }

  &-search {
    @apply flex w-full shrink-0 overflow-auto;
    @apply bg-$List-search-bg;
  }
}

.separator {
  @apply border-b-1 border-ca;
}

[placement^='top'] {
  .list-search {
    @apply order-2;
  }

  .separator {
    @apply order-1;
  }
}

// .list-search {
//   @apply flex-wrap;
// }

.no-data {
  @apply flex italic color-ca text-caption p-t-2 p-x-3;
}

.selector {
  .no-data {
    @apply p-x-3;
  }
}

.drop-indicator {
  @apply fixed h-2px bg-primary w-full rounded-full pointer-events-none z-$zMax;

  &__icon {
    @apply w-5 h-5 relative -left-5 rounded-custom
    color-primary bg-white dark:bg-darker;
  }
}
</style>
