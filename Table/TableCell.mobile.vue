<!-- eslint-disable no-case-declarations -->
<script setup lang="ts">
// Models
import type { TableColumn } from '~/components/Table/models/table-column.model'

// Injections
import { tableInlineEditKey } from '~/components/Table/provide/table.provide'

type IProps = {
  column: TableColumn
  columnIndex: number
  editable?: boolean
  row: any
}

const props = defineProps<IProps>()

// Injections
const {
  isEditing,
  editValue,
  editRow,
  handleEditRow,
  handleCancelEditRow,
  handleSaveRow,
} = injectStrict(tableInlineEditKey, {} as any)

// Utils
function focusSiblingCell(
  direction: 'previous' | 'next',
  lastEl?: HTMLElement,
) {
  const el = lastEl ?? self?.vnode?.el
  let siblingCell = el?.[`${direction}ElementSibling`] as
    | HTMLElement
    | null
    | undefined
  const isLastCell = !siblingCell || !siblingCell?.classList?.contains?.('cell')
  const parentRowEl = self?.vnode.el?.closest(
    '.virtual-scroll__row',
  ) as HTMLElement

  let parentRowElSibling: HTMLElement | null = null
  if (isLastCell && !parentRowEl) {
    return
  } else if (isLastCell) {
    parentRowElSibling = parentRowEl?.[
      `${direction}ElementSibling`
    ] as HTMLElement
  }

  const isLastParentRow = !parentRowElSibling?.classList?.contains?.('virtual-scroll__row')
  if (isLastCell && isLastParentRow) {
    return
  }

  siblingCell = isLastCell
    ? parentRowElSibling?.querySelector?.(`.cell${direction === 'previous' ? ':last-child' : ''}`)
    : siblingCell
  const siblingCellEditBtn = siblingCell?.querySelector?.(
    '.cell-edit-btn',
  ) as HTMLButtonElement

  if (siblingCellEditBtn) {
    siblingCellEditBtn.click()
  } else if (siblingCell) {
    return focusSiblingCell(direction, siblingCell)
  }

  return siblingCell
}

function focusFieldInNextRow(field?: string) {
  handleSaveRow(true, { onSave: props.column._editComponent?.onSave })

  const _field = field ?? props.column.field

  const parentRowEl = self?.vnode.el?.closest(
    '.virtual-scroll__row',
  ) as HTMLElement
  const nextRowEditBtnEl = (parentRowEl?.nextElementSibling as HTMLElement)
    ?.querySelector(`.cell[data-field="${_field}"]`)
    ?.querySelector('.cell-edit-btn') as HTMLButtonElement

  if (nextRowEditBtnEl) {
    nextRowEditBtnEl.click()

    const virtualScroller = parentRowEl.closest(
      '.virtual-scroll',
    ) as HTMLElement

    const scrollTop = parentRowEl.style.getPropertyValue('--translateY')
    if (scrollTop) {
      virtualScroller.scrollTop = Number.parseInt(scrollTop)
    }
  }
}

// Layout
const self = getCurrentInstance()
const inputEl = ref<any>()
const col = toRef(props, 'column')
const siblingCell = ref<HTMLElement | null | undefined>()

const { pause, resume } = useIntersectionObserver(
  siblingCell,
  entries => {
    if (entries[0].intersectionRatio < 1) {
      siblingCell.value?.scrollIntoView()
    }

    pause()
  },
  { immediate: false },
)

const isEditable = computed(() => {
  if (!props.editable) {
    return false
  }

  const isCellEditable = typeof col.value.noEdit === 'function'
    ? !col.value.noEdit(props.row)
    : !col.value.noEdit

  return isCellEditable
})

const isEditingField = computed(() => {
  return (
    isEditing.value
    && editRow.value?.row === props.row
    && (editRow.value?.column === col.value || !editRow.value?.column)
  )
})

function handleEditCell() {
  if (isEditingField.value) {
    handleCancelEditRow()

    return
  }

  handleEditRow(props.row, props.column)
}

// Keyboard shortcuts
function handleKeyDown(e: KeyboardEvent) {
  const isControlKey = e.ctrlKey || e.metaKey

  switch (e.key) {
    case 'Escape':
      handleCancelEditRow()
      break

    case 'Enter':
      setTimeout(() => {
        handleSaveRow(undefined, { onSave: props.column._editComponent?.onSave })

        if (isControlKey) {
          return
        }

        handleKeyDown({
          ...e,
          key: 'ArrowDown',
          ctrlKey: true,
        } as KeyboardEvent)
      })

      break

    case 'ArrowDown':
      if (!isControlKey) {
        return
      }

      e.preventDefault?.()
      e.stopPropagation?.()

      resume()
      siblingCell.value = focusSiblingCell('next')

      break

    case 'ArrowUp':
      if (!isControlKey) {
        return
      }

      e.preventDefault?.()
      e.stopPropagation?.()

      resume()
      siblingCell.value = focusSiblingCell('previous')

      break

    default:
      break
  }
}

function selectSelf(self: any) {
  nextTick(() => {
    self.component?.exposed?.select?.() ?? self.component?.exposed?.focus?.()
  })
}
</script>

<template>
  <div
    class="cell"
    :class="{ 'is-editable': editable, 'is-editing': isEditingField }"
    :data-field="col.field"
  >
    <!-- Label -->
    <div
      v-if="!column.hideLabel"
      class="cell-label"
      :class="{ 'non-editable': !editable || !isEditable }"
    >
      <span truncate>
        {{ column._label }}
      </span>

      <Btn
        v-if="editable && isEditable"
        size="xs"
        :preset="isEditingField ? 'CLOSE' : 'EDIT'"
        class="cell-edit-btn"
        tabindex="-1"
        @click.stop.prevent="handleEditCell"
      />
    </div>

    <!-- Value -->
    <div
      class="cell-value"
      :class="[col.classes, { 'col-span-2': col.hideLabel }]"
    >
      <!-- Edit mode -->
      <div
        v-if="isEditingField"
        flex="~ gap-1"
        :class="{ 'm-r-18': columnIndex === 0 }"
      >
        <Component
          :is="col._editComponent.component"
          ref="inputEl"
          :model-value="get(editValue, col.field)"
          size="sm"
          v-bind="col._editComponent.props"
          grow
          input-class="color-black dark:color-white"
          :input-props="{ onKeydown: handleKeyDown }"
          @update:model-value="set(editValue, col.field, $event)"
          @vue:mounted="selectSelf"
        />

        <Btn
          size="sm"
          preset="SAVE"
          tabindex="-1"
          @click.stop.prevent="focusFieldInNextRow()"
        />
      </div>

      <!-- Regular field -->
      <ValueFormatter
        v-else
        :value="col.valueGetter(row)"
        :data-type="col.dataType"
        :row="row"
        :format="col.format"
        :empty-value="{}"
      >
        <template #default="{ val }">
          <slot :value="val">
            <!-- Boolean -->
            <Checkbox
              v-if="col.dataType === 'boolean'"
              :model-value="col.valueGetter(row)"
              :editable="false"
              :label="val"
            />

            <!-- Link -->
            <NuxtLink
              v-else-if="col.link?.(row)"
              class="link"
              :to="col.link(row) || ''"
              v-bind="col.linkProps"
              p="x-2"
              @click.stop
            >
              {{ val }}
            </NuxtLink>

            <span
              v-else
              class="p-x-2 truncate"
            >
              {{ val }}
            </span>
          </slot>
        </template>
      </ValueFormatter>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cell {
  @apply grid col-span-2 leading-tight items-center
    p-l-2 p-r-1 rounded-custom;

  grid-template-columns: subgrid;

  &.is-editable:hover,
  &.is-editing {
    @apply shadow-consistent-xs shadow-primary bg-white dark:bg-darker;
  }

  &-label,
  &-value {
    @apply flex relative truncate;
  }

  &-label {
    @apply flex items-center font-rem-14 font-semibold min-h-8;

    @apply lt-md:font-rem-12;
  }

  &-value {
    @apply flex-col;
  }

  &-edit-btn {
    @apply top-0 right-0 hidden m-t-1;
    @apply '!absolute';
  }

  &:hover,
  &.is-editing {
    .cell-edit-btn {
      @apply flex;
    }
  }
}
</style>
