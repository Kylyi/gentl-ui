<script setup lang="ts">
// Types
import {
  IQueryBuilderGroup,
  IQueryBuilderGroupProps,
} from '~/components/QueryBuilder/types/query-builder-group-props.type'

// Models
import { ComparatorEnum } from '~/libs/App/data/enums/comparator.enum'

// Injections
import {
  qbCollapsedKey,
  qbHoveredItemKey,
  qbItemsKey,
} from '~/components/QueryBuilder/provide/query-builder.provide'

const props = defineProps<IQueryBuilderGroupProps>()
const emits = defineEmits<{
  (e: 'delete:row', item: IQueryBuilderGroup): void
}>()

// Injections
const items = injectStrict(qbItemsKey)
const hoveredRow = injectStrict(qbHoveredItemKey)
const collapsed = injectStrict(qbCollapsedKey)

// Utils
const { t } = useI18n()

// Layout
const group = toRef(props, 'item')

function handleAddCondition() {
  group.value.children = [
    ...group.value.children,
    {
      id: new Date().getTime().toString(),
      field: undefined as unknown as string,
      comparator: undefined as unknown as ComparatorEnum,
      value: undefined as unknown as string,
      path: `${group.value.path}.children.${group.value.children.length}`,
    },
  ]
}

function handleAddGroup() {
  group.value.children = [
    ...group.value.children,
    {
      id: new Date().getTime().toString(),
      isGroup: true,
      children: [],
      condition: 'AND',
      path: `${group.value.path}.children.${group.value.children.length}`,
    },
  ]
}

function handleRemoveGroup() {
  const idx = group.value.path.split('.').pop()
  const parentPath = props.item.path.split('.').slice(0, -2).join('.')
  const parent = get(toValue(items), parentPath)

  parent.children.splice(idx, 1)

  parent.children = [...parent.children]

  emits('delete:row', group.value)
}

// Collapsing
const collapseProps = computed(() => {
  return collapsed.value[props.item.id]
    ? {
        label: t('queryBuilder.expand'),
        icon: 'line-md:chevron-small-right order-2',
      }
    : {
        label: t('queryBuilder.collapse'),
        icon: 'line-md:chevron-small-right rotate-90 order-2',
      }
})
</script>

<template>
  <ul
    class="qb-row qb-group"
    :class="{
      'is-hovered': hoveredRow === item,
      'is-base': !level,
      'is-last-child': isLastChild,
    }"
    @mouseover.stop="hoveredRow = item"
    @mouseleave="hoveredRow = undefined"
  >
    <!-- Group row -->
    <div class="qb-group-row">
      <QueryBuilderMoveHandler v-if="level" />

      <!-- Condition -->
      <div class="qb-group-condition">
        <!-- And -->
        <Btn
          :class="{ 'is-active': item.condition === 'AND' }"
          :label="$t('queryBuilder.and')"
          size="xs"
          @click="item.condition = 'AND'"
        />

        <!-- Or -->
        <Btn
          :class="{ 'is-active': item.condition === 'OR' }"
          :label="$t('queryBuilder.or')"
          size="xs"
          @click="item.condition = 'OR'"
        />
      </div>

      <!-- Actions -->
      <div class="qb-group-actions">
        <Btn
          size="xs"
          no-uppercase
          v-bind="collapseProps"
          w="20"
          align="right"
          border="1 ca"
          @click="collapsed[item.id] = !collapsed[item.id]"
        />

        <!-- Remove group -->
        <Btn
          class="on-hover"
          icon="material-symbols:delete-sweep-rounded !w-5 !h-5"
          color="negative"
          size="xs"
          m="l-2"
          :class="{ invisible: !level }"
          @click="handleRemoveGroup"
        />
      </div>
    </div>

    <template v-if="!collapsed[item.id]">
      <!-- Children rows -->
      <QueryBuilderRow
        v-for="(child, idx) in item.children"
        :key="child.path"
        :item="child"
        :parent="item"
        :level="level + 1"
        :is-last-child="idx === item.children.length - 1"
      />

      <!-- Controls -->
      <div class="qb-group-controls">
        <!-- Add row -->
        <Btn
          :label="$t('queryBuilder.addCondition')"
          icon="eva:plus-fill"
          color="ca"
          bg="white dark:darker"
          no-uppercase
          size="sm"
          border="ca 1 dashed"
          @click="handleAddCondition"
        />

        <!-- Add group -->
        <Btn
          :label="$t('queryBuilder.addGroup')"
          icon="formkit:add"
          bg="white dark:darker"
          color="ca"
          no-uppercase
          size="sm"
          border="ca 1 dashed"
          @click="handleAddGroup"
        />
      </div>
    </template>
  </ul>
</template>

<style scoped lang="scss">
.qb-group {
  --apply: relative flex flex-col rounded-custom p-r-0 p-l-2 m-l-5 border-1 border-transparent;

  &.is-hovered {
    --apply: bg-white dark:bg-darker shadow-consistent shadow-ca;

    & > li {
      --apply: border-1 border-ca border-dashed;
    }
  }

  &-row {
    --apply: flex gap-2 flex-wrap min-h-10 items-center;
  }

  &-condition {
    --apply: flex gap-1 items-center grow;

    .is-active {
      --apply: bg-primary color-white;
    }
  }

  &-actions {
    --apply: flex gap-1 items-center p-r-4;
  }

  &-controls {
    --apply: flex gap-2 m-l-9 p-y-1;
  }
}

.qb-group:not(.is-base) {
  &::before {
    --apply: absolute content-empty -left-3 top-0 h-full
      border-l-1 border-ca border-dashed;
  }

  &::after {
    --apply: absolute content-empty -left-3 w-3
      border-b-1 border-ca border-dashed;

      // This is kinda specific but it shouldn't really cause issues if we
      // don't mess with input sizes
    --apply: top-19.5px;
  }
}

.qb-group:not(.is-base).is-last-child::before {
  --apply: h-19.5px;
}
</style>
