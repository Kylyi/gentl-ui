<script setup lang="ts">
import { useAppStore } from '~/libs/App/app.store'

// Store
const appStore = useAppStore()
const { appState } = storeToRefs(appStore)

// Layout
function setAutoSaveLayout(value: boolean | undefined | null) {
  appStore.setAppState({
    table: {
      autoSaveSchema: !!value,
    },
  })
}

function setAutoFitColumns(value: boolean | undefined | null) {
  appStore.setAppState({
    table: {
      autoFitColumns: !!value,
      autoStretchColumns: false,
    },
  })
}

function setAutoStretchColumns(value: boolean | undefined | null) {
  appStore.setAppState({
    table: {
      autoFitColumns: false,
      autoStretchColumns: !!value,
    },
  })
}
</script>

<template>
  <Dialog
    header-class="p-l-3 p-r-1"
    h="!auto"
    :ui="{ contentClass: 'p-3' }"
    :title="$t('table.options')"
  >
    <!-- Auto-save table layout -->
    <Toggle
      :model-value="appState.table?.autoSaveSchema"
      :label="$t('app.autoSaveLayout')"
      @update:model-value="setAutoSaveLayout"
    />

    <span class="hint">
      {{ $t('app.autoSaveLayoutExplain') }}
    </span>

    <Separator m="y-4" />

    <!-- Auto-fit columns -->
    <Checkbox
      :model-value="appState.table?.autoFitColumns"
      :label="$t('table.autoFitColumns')"
      @update:model-value="setAutoFitColumns"
    />

    <span class="hint">
      {{ $t('app.autoFitColumnsExplain') }}
    </span>

    <Separator m="y-4" />

    <!-- Auto-stretch columns -->
    <Checkbox
      :model-value="appState.table?.autoStretchColumns"
      :label="$t('table.autoStretchColumns')"
      @update:model-value="setAutoStretchColumns"
    />

    <span class="hint">
      {{ $t('app.autoStretchColumnsExplain') }}
    </span>
  </Dialog>
</template>

<style scoped lang="scss">
.hint {
  @apply text-caption rounded-custom p-2 bg-gray-50 dark:bg-gray-800;
}
</style>
