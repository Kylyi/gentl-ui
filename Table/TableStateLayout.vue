<script setup lang="ts">
import { config } from '~/config'

// Components
import BtnConfirmation from '~/components/Button/BtnConfirmation.vue'

// Injections
import { getTableStateKey } from '~/components/Table/provide/table.provide'

type IProps = {
  storageKey: string
}

const props = defineProps<IProps>()

// INJECTIONS
const getTableState = injectStrict(getTableStateKey)

// UTILS
const { t } = useI18n()

// LAYOUT
const btnConfirmationEl = ref<InstanceType<typeof BtnConfirmation>>()
const storageKey = `table-layouts-${props.storageKey || 'default'}`
const selectedTableLayout = useLocalStorage(
  `table-layout-${props.storageKey}`,
  ''
)
const tableLayouts = useLocalStorage<any[]>(storageKey, [])
const tableState = computed(() => getTableState())

function handleSelectTableLayout(tableLayout?: any) {
  // Resetting table state
  if (!tableLayout) {
    // TODO: Implement reset table

    return
  }

  const { stateName, _isCreate } = tableLayout

  // Added a new layout
  if (_isCreate) {
    const dto = {
      state: tableState.value,
      tableName: props.storageKey,
      stateName,
    }

    if (config.table.useServerState) {
      // TODO: Implement
    } else {
      tableLayouts.value = [...tableLayouts.value, dto]
    }
  }

  // Selected an existing layout
  else {
    // recalculateTableColumns(true)
    // refreshData()
  }

  selectedTableLayout.value = stateName

  notify(t('saved'), 'positive')
}

function overrideSelectedTableLayout() {
  if (config.table.useServerState) {
    // TODO: Implement
  } else {
    // TODO: Table state when not using server state
    // const foundLayout = tableLayouts.value.find(
    //   layout => layout.name === tableState.value.layout
    // )
    // if (foundLayout) {
    //   foundLayout.layout = tableState.value
    //   tableLayouts.value = [...tableLayouts.value]
    // }
  }

  btnConfirmationEl.value?.showTemporarily()
}

// Data fetching
function getLayouts(payload: { search?: string }) {
  // TODO: Implement

  return []
}
</script>

<template>
  <Section
    :title="$t('table.layoutState')"
    title-filled
    flex="~ col"
  >
    <Selector
      :model-value="selectedTableLayout"
      option-label="stateName"
      :load-data="{
        fnc: getLayouts,
        onSearch: true,
        mapKey: 'getTableStateViaQuery',
      }"
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
          no-uppercase
          self-center
          size="sm"
          color="primary"
          outlined
          :disabled="!selectedTableLayout"
          @click="overrideSelectedTableLayout"
        >
          <BtnConfirmation
            ref="btnConfirmationEl"
            :label="$t('saved')"
          />
        </Btn>

        <!-- APPLY -->
        <!-- <Btn
          :label="$t('apply')"
          size="sm"
          no-uppercase
          color="primary"
          outlined
          :disabled="!tableState.layout"
          @click="handleApplyLayout"
        /> -->
      </div>

      <!-- <span
        text="caption"
        grow
        font="rem-11"
      >
        {{ tableState.layout ? $t('table.layoutStateSave') : '&nbsp;' }}
      </span> -->
    </div>
  </Section>

  <Separator inset />

  <Btn
    :label="$t('table.reset')"
    no-uppercase
    icon="fluent:arrow-reset-48-regular"
    m="3"
  >
    <MenuConfirmation @ok="handleSelectTableLayout()" />
  </Btn>
</template>
