<script setup lang="ts">
import { ITableState } from '~/components/Table/types/table-state.type'

type ISavedTableLayout = {
  name: string
  layout: ITableState
}

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
      w="90"
      placement="bottom-end"
    >
      <Toggle
        v-if="useIncludeDeleted"
        v-model="includeDeleted"
        :label="$t('includeArchived')"
      />

      <TableStateLayout :storage-key="storageKey" />
    </Menu>
  </Btn>
</template>
