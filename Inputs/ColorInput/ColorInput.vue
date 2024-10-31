<script setup lang="ts">
import { config } from '~/components/config/components-config'

// Types
import type { IColorProps } from '~/components/Inputs/ColorInput/types/color-props.type'

// Functions
import { useFieldUtils } from '~/components/Field/functions/useFieldUtils'

// Components
import MenuProxy from '~/components/MenuProxy/MenuProxy.vue'
import Field from '~/components/Field/Field.vue'

const props = withDefaults(defineProps<IColorProps>(), {
  icon: 'i-material-symbols:format-color-text-rounded',
  noIcon: true,
  required: undefined,
  stackLabel: undefined,
  disallowedColors: () => config.colorInput?.props?.disallowedColors ?? [],
})
const emits = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

// Lifcecycle
onMounted(() => {
  referenceEl.value = unrefElement(fieldEl as any)?.querySelector(
    '.wrapper__body',
  ) as HTMLDivElement
})

// Layout
const fieldEl = ref<InstanceType<typeof Field>>()
const referenceEl = ref<HTMLDivElement>()
const menuEl = ref<InstanceType<typeof MenuProxy>>()
const model = useVModel(props, 'modelValue', emits)

const modelLabel = computed(() => {
  if (!model.value) {
    return ''
  }

  const label = $t(`color.${model.value}`)

  return label === `color.${model.value}` ? model.value : label
})

function handlePickColor(color?: string) {
  model.value = color
  // fieldEl.value?.focus()

  // menuEl.value?.hide()
  // nextTick(() => {
  //   fieldEl.value?.blur()
  // })
  $hide()
}

// Field
const { el, getFieldProps, handleFocusOrClick } = useFieldUtils({
  props,
  menuElRef: menuEl,
})

const fieldProps = getFieldProps(props)
</script>

<template>
  <Field
    ref="fieldEl"
    v-bind="fieldProps"
    :no-content="!model"
    @focus="handleFocusOrClick"
  >
    <template #prepend>
      <div
        class="w-6 h-6 rounded-custom border-1 border-ca m-l-2"
        :style="{ backgroundColor: model }"
        data-cy="color-picker-preview"
      />
    </template>

    <span ref="el">
      {{ modelLabel || '&nbsp;' }}
    </span>

    <MenuProxy
      ref="menuEl"
      manual
      tabindex="-1"
      :fit="false"
      placement="bottom-start"
      :reference-target="referenceEl"
      no-uplift
    >
      <ColorBrandingPicker
        v-model="model"
        :rgba
        :disallowed-colors
        @update:model-value="handlePickColor"
      />
    </MenuProxy>

    <template
      v-if="!noIcon"
      #append
    >
      <div
        :class="icon"
        m="x-2"
        tabindex="-1"
        cursor="pointer"
      />
    </template>
  </Field>
</template>
