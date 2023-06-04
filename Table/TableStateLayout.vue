<script setup lang="ts">
// TYPES
import type { ITableState } from '~/components/Table/types/table-state.type'
import type { IItem } from '~/libs/App/types/item.type'

// COMPONENTS
import BtnConfirmation from '~/components/Button/BtnConfirmation.vue'

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
const refreshData = injectStrict(refreshTableDataKey)

// LAYOUT
const btnConfirmationEl = ref<InstanceType<typeof BtnConfirmation>>()
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
      refreshData()
    }
  }
}

function handleApplyLayout() {
  if (!tableState.value.layout) {
    return
  }

  const foundLayout = tableLayouts.value.find(
    layout => layout.name === tableState.value.layout
  )

  if (foundLayout) {
    updateTableState(foundLayout.layout)
    recalculateTableColumns(true)
    refreshData()
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

  btnConfirmationEl.value?.showTemporarily()
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
      label-inside
      @update:model-value="handleSelectTableLayout"
    />

    <div flex="~ col gap-y-3">
      <div
        flex="~ gap-x-1"
        justify="end"
      >
        <!-- OVERRIDE -->
        <Btn
          shrink-0
          :label="$t('table.layoutStateOverride')"
          :disabled="!tableState.layout"
          no-uppercase
          self-center
          size="sm"
          @click="overrideSelectedTableLayout"
        >
          <BtnConfirmation
            ref="btnConfirmationEl"
            :label="$t('saved')"
          />
        </Btn>

        <!-- APPLY -->
        <Btn
          :label="$t('apply')"
          size="sm"
          no-uppercase
          color="primary"
          outlined
          :disabled="!tableState.layout"
          @click="handleApplyLayout"
        />
      </div>

      <span
        text="caption"
        grow
        font="rem-11"
      >
        {{ tableState.layout ? $t('table.layoutStateSave') : '&nbsp;' }}
      </span>
    </div>
  </Section>
</template>
