<script setup lang="ts">
// TYPES
import { IListProps } from '~~/components/List/types/list-props.type'

// COMPOSITION FUNCTIONS
import { useList } from '@/components/List/functions/useList'

// COMPONENTS
import ListVirtualContainer from '~~/components/List/ListVirtualContainer.vue'
import ListContainer from '~~/components/List/ListContainer.vue'

const props = withDefaults(defineProps<IListProps>(), {
  clearable: true,
  disabledFnc: () => false,
  emptyValue: null,
  groupBy: () => [],
  items: () => [],
  itemKey: 'id',
  itemLabel: 'label',
})

defineEmits<{
  (e: 'selected', item: any): void
  (e: 'added', item: any): void
  (e: 'added-multiple', items: any[]): void
  (e: 'removed', item: any): void
  (e: 'search', payload: { hasExactMatch: boolean; search: string }): void
}>()

const containerEl = ref<InstanceType<typeof ListVirtualContainer>>()

const ContainerComponent = computed(() => {
  return props.virtual || props.items.length >= 1e3
    ? ListVirtualContainer
    : ListContainer
})

const {
  arr,
  hoveredIdx,
  listEl,
  listRowProps,
  search,
  searchEl,
  selectedByKey,
  handleMouseOver,
  handleSelectFiltered,
  handleSelectItem,
} = useList(props, containerEl)

defineExpose({
  handleSelectItem: (option: any) => handleSelectItem(option),
  clearSearch: () => {
    searchEl.value?.clear()
    search.value = ''
  },
})
</script>

<template>
  <div
    ref="listEl"
    class="list"
    :class="{ 'is-bordered': bordered }"
  >
    <!-- SEARCH -->
    <template v-if="!noSearch">
      <div class="list-search">
        <SearchInput
          ref="searchEl"
          v-model="search"
          m="2"
          grow
          class="bg-white dark:bg-darker"
          :autofocus="!noAutofocus"
        />

        <slot name="after-search" />
      </div>

      <!-- SEPARATOR -->
      <div class="separator" />
    </template>

    <!-- LOADING -->
    <div
      v-if="loading"
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

    <Component
      :is="ContainerComponent"
      ref="containerEl"
      :items="arr"
      :class="contentClass"
    >
      <template #default="{ item, index }">
        <ListRow
          :item="item"
          :is-selected="!('isGroup' in item) && !!selectedByKey[item.id]"
          :is-hovered="hoveredIdx === index"
          :is-disabled="disabledFnc(item)"
          v-bind="listRowProps"
          :row-height="'isGroup' in item ? rowGroupHeight : rowHeight"
          @mouseover="handleMouseOver(item, index)"
          @click="handleSelectItem(item)"
          @pointerdown.prevent=""
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
