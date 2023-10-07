<script setup lang="ts">
type IProps = {
  dataType: DataType
}

const props = defineProps<IProps>()

const shortcut = computed(() => {
  return COMPONENTS_BY_DATATYPE_MAP[props.dataType]?.shortcut
})
</script>

<template>
  <div
    v-if="shortcut"
    class="data-type-shortcut"
  >
    {{ shortcut }}
  </div>
</template>

<style scoped lang="scss">
.data-type-shortcut {
  --apply: uppercase text-caption w-6 h-6 rounded-full border-1 border-ca
    flex-inline flex-center;
}
</style>
