<script setup lang="ts">
type IProps = {
  dataType: DataType
}

const props = defineProps<IProps>()

const shortcut = computed(() => {
  return COMPONENTS_BY_DATATYPE_MAP[props.dataType]?.shortcutIcon
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
