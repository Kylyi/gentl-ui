<script setup lang="ts">
// TYPES
import type { IColorProps } from '~/components/Inputs/ColorInput/types/color-props.type'

// COMPOSITION FUNCTIONS
import { useFieldUtils } from '~/components/Field/functions/useFieldUtils'

// COMPONENTS
import MenuProxy from '~/components/MenuProxy/MenuProxy.vue'
import Field from '~/components/Field/Field.vue'

const props = withDefaults(defineProps<IColorProps>(), {
  icon: 'material-symbols:format-color-text-rounded',
  stackLabel: undefined,
  labelInside: undefined,
  inline: undefined,
})
const emits = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

// LAYOUT
const fieldEl = ref<InstanceType<typeof Field>>()
const referenceEl = ref<HTMLDivElement>()
const menuEl = ref<InstanceType<typeof MenuProxy>>()
const model = useVModel(props, 'modelValue', emits)

function handlePickColor(color?: string) {
  model.value = color
  fieldEl.value?.focus()

  menuEl.value?.hide()
  nextTick(() => {
    fieldEl.value?.blur()
  })
}

// FIELD
const { getFieldProps, handleClickWrapper, handleFocusOrClick } = useFieldUtils(
  {
    props,
    menuElRef: menuEl,
  }
)

const fieldProps = getFieldProps(props)

onMounted(() => {
  nextTick(() => {
    referenceEl.value = unrefElement(fieldEl as any)?.querySelector(
      '.control'
    ) as HTMLDivElement
  })
})
</script>

<template>
  <Field
    ref="fieldEl"
    v-bind="fieldProps"
    :no-content="!model"
    @click="handleClickWrapper"
    @focus="handleFocusOrClick"
  >
    <span :style="{ color: model }">
      {{ model || '&nbsp;' }}
    </span>

    <MenuProxy
      ref="menuEl"
      hide-header
      manual
      tabindex="-1"
      :reference-target="referenceEl"
    >
      <ColorBrandingPicker
        v-model="model"
        @update:model-value="handlePickColor"
      />
    </MenuProxy>

    <template #append>
      <div
        size="sm"
        :class="icon"
        m="x-2"
        tabindex="-1"
        :style="{ color: model }"
      />
    </template>
  </Field>
</template>
