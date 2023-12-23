<script setup lang="ts">
// Functions
import { getInputByDataType } from '~/components/Inputs/DynamicInput/constants/input-by-datatype.map'

// Components

type IProps = {
  dataType?: ExtendedDataType
  modelValue?: any
}

const props = defineProps<IProps>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

defineExpose({
  focus: () => inputEl.value?.focus?.(),
  select: () => inputEl.value?.select?.(),
  blur: () => inputEl.value?.blur?.(),
})

// Layout
const inputEl = ref<any>()
const model = useVModel(props, 'modelValue', emits)

const component = computed(() => {
  return getInputByDataType(props.dataType ?? 'string')
})
</script>

<template>
  <Component
    :is="component.component"
    ref="inputEl"
    v-model="model"
    v-bind="component.props"
  />
</template>
