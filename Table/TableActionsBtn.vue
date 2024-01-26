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
      <!-- Archived items show/hide -->
      <template v-if="useIncludeDeleted">
        <Toggle
          v-model="includeDeleted"
          :label="$t('general.includeArchived')"
        />
        <Separator inset />
      </template>

      <!-- Table url -->
      <TableUrl />
    </Menu>
  </Btn>
</template>
