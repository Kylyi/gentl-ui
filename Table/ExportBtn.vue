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
    icon="tabler:database-export"
    color="ca"
  >
    <Menu
      hide-header
      dense
      p="1"
      content-class="overflow-hidden"
    >
      <Btn
        icon="bi:filetype-xlsx"
        :loading="loading"
        @click="$emit('export', 'xlsx')"
      />
      <Btn
        icon="bi:filetype-csv"
        :loading="loading"
        @click="$emit('export', 'csv')"
      />
    </Menu>
  </Btn>
</template>
