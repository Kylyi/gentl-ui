<script setup lang="ts">
// Functions
import { getInputByDataType } from '~/components/Inputs/DynamicInput/constants/input-by-datatype.map'

type IProps = {
  dataType: ExtendedDataType
  custom?: boolean
}

const props = defineProps<IProps>()

const shortcut = computed(() => {
  if (props.custom) {
    return 'i-carbon:area-custom'
  }

  return getInputByDataType(props.dataType)?.icon
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
  --apply: uppercase text-caption w-5 h-5 flex-inline;
}
</style>
