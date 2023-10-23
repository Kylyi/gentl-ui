<script setup lang="ts">
type IProps = {
  dataType: DataType
  custom?: boolean
}

const props = defineProps<IProps>()

const shortcut = computed(() => {
  if (props.custom) {
    return 'carbon:area-custom'
  }

  return COMPONENTS_BY_DATATYPE_MAP[props.dataType.replace('Simple', '')]
    ?.shortcutIcon
})
</script>

<template>
  <div
    v-if="shortcut"
    class="data-type-shortcut"
    :class="shortcut"
  />
</template>

<style scoped lang="scss">
.data-type-shortcut {
  --apply: uppercase text-caption w-5 h-5 rounded-full flex-inline flex-center
    self-center;
}
</style>
