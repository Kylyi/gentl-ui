<script setup lang="ts">
type IProps = {
  loading?: boolean
}

defineProps<IProps>()
defineEmits<{
  (e: 'export', type: 'xlsx' | 'csv'): void
}>()
</script>

<template>
  <Btn
    icon="material-symbols:download"
    color="ca"
    no-uppercase
    size="sm"
    p="!l-1"
    outlined
  >
    <div
      flex="~ gap-2"
      p="r-2"
      font="normal"
      text="sm"
      items-center
    >
      {{ $t('table.export') }}

      <div class="line-md:chevron-small-right rotate-90" />
    </div>

    <Menu
      hide-header
      dense
      p="1"
      content-class="overflow-hidden"
    >
      <!-- XLSX -->
      <Btn
        :label="$t('export.excel')"
        icon="bi:filetype-xlsx"
        :loading="loading"
        align="left"
        @click="$emit('export', 'xlsx')"
      />

      <!-- CSV -->
      <Btn
        :label="$t('export.csv')"
        icon="bi:filetype-csv"
        :loading="loading"
        align="left"
        @click="$emit('export', 'csv')"
      />
    </Menu>
  </Btn>
</template>
