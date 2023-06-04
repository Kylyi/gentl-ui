<script setup lang="ts">
type IProps = {
  storageKey?: string
  includeDeleted: boolean
  useIncludeDeleted?: boolean
}

const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'update:includeDeleted', val: boolean): void
}>()

const includeDeleted = useVModel(props, 'includeDeleted', emits)
</script>

<template>
  <Btn
    icon="material-symbols:more-vert"
    color="ca"
    self-center
  >
    <Menu
      hide-header
      dense
      w="100"
      placement="bottom-end"
    >
      <Toggle
        v-if="useIncludeDeleted"
        v-model="includeDeleted"
        :label="$t('includeArchived')"
      />

      <TableStateLayout :storage-key="storageKey" />

      <Separator inset />

      <TableUrl />
    </Menu>
  </Btn>
</template>
