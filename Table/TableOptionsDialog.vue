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

function setFitColumns(mode: 'auto' | 'content' | 'stretch', unset?: boolean) {
  if (unset) {
    appStore.setAppState({
      table: { fit: null },
    })
  } else {
    appStore.setAppState({
      table: { fit: mode },
    })
  }
}
</script>

<template>
  <Dialog
    header-class="p-l-3 p-r-1"
    h="!auto"
    w="200"
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

    <Separator m="y-2" />

    <!-- Auto-fit columns -->
    <Checkbox
      :model-value="appState.table?.fit === 'content'"
      :label="$t('table.autoFitColumns')"
      @update:model-value="setFitColumns('content', appState.table?.fit === 'content')"
    />

    <span class="hint">
      {{ $t('app.autoFitColumnsExplain') }}
    </span>

    <Separator m="y-2" />

    <!-- Auto-justify columns -->
    <Checkbox
      :model-value="appState.table?.fit === 'auto'"
      :label="$t('table.autoJustifyColumns')"
      @update:model-value="setFitColumns('auto', appState.table?.fit === 'auto')"
    />

    <span class="hint">
      {{ $t('app.autoJustifyColumnsExplain') }}
    </span>

    <span class="hint">
      {{ $t('app.autoJustifyColumnsExplain2') }}
    </span>

    <Separator m="y-2" />

    <!-- Auto-stretch columns -->
    <Checkbox
      :model-value="appState.table?.fit === 'stretch'"
      :label="$t('table.autoStretchColumns')"
      @update:model-value="setFitColumns('stretch', appState.table?.fit === 'stretch')"
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
