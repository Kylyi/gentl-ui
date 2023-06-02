<script setup lang="ts">
// TYPES
import type { ITableState } from '~/components/Table/types/table-state.type'
import type { IItem } from '~/libs/App/types/item.type'

type ISavedTableLayout = {
  name: string
  layout: ITableState
}

type IProps = {
  storageKey?: string
}

const props = defineProps<IProps>()

// INJECTIONS
const tableState = injectStrict(tableStateKey)
const recalculateTableColumns = injectStrict(recalculateTableColumnsKey)
const updateTableState = injectStrict(updateTableStateKey)

// LAYOUT
const storageKey = `table-layouts-${props.storageKey || 'default'}`
const tableLayouts = useLocalStorage<ISavedTableLayout[]>(storageKey, [])

function handleSelectTableLayout(tableLayout: IItem) {
  if (!tableLayout) {
    updateTableState({ layout: undefined })

    return
  }

  const { name, _isNew } = tableLayout

  // ADDED A NEW LAYOUT
  if (_isNew) {
    tableLayouts.value = [
      ...tableLayouts.value,
      {
        name,
        layout: tableState.value,
      },
    ]

    updateTableState({ layout: name })
  }

  // SELECTED EXISTING LAYOUT
  else {
    const foundLayout = tableLayouts.value.find(layout => layout.name === name)

    if (foundLayout) {
      const { name, ...layoutData } = foundLayout

      updateTableState({
        ...layoutData.layout,
        layout: name,
      })
      recalculateTableColumns(true)
    }
  }
}

function overrideSelectedTableLayout() {
  const foundLayout = tableLayouts.value.find(
    layout => layout.name === tableState.value.layout
  )

  if (foundLayout) {
    foundLayout.layout = tableState.value
    tableLayouts.value = [...tableLayouts.value]
  }
}
</script>

<template>
  <Section
    :title="$t('table.layoutState')"
    title-filled
  >
    <Selector
      :model-value="tableState.layout"
      :options="tableLayouts"
      option-key="name"
      option-label="name"
      :label="$t('table.layoutStateChoose')"
      p="y-2"
      allow-add
      no-local-add
      clearable
      @update:model-value="handleSelectTableLayout"
    />

    <div
      flex="~ gap-x-3"
      justify="between"
    >
      <span
        text="caption"
        grow
        font="rem-11"
      >
        {{ tableState.layout ? $t('table.layoutStateSave') : '&nbsp;' }}
      </span>

      <CrudBtnSave
        shrink-0
        labels
        :disabled="!tableState.layout"
        @save="overrideSelectedTableLayout"
      />
    </div>
  </Section>
</template>
