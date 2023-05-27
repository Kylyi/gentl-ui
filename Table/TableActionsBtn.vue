<script setup lang="ts">
type IProps = {
  includeDeleted: boolean
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
      placement="bottom-end"
    >
      <Toggle
        v-model="includeDeleted"
        :label="$t('includeArchived')"
      />
    </Menu>
  </Btn>
</template>
