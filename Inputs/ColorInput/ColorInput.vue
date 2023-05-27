<script setup lang="ts">
// TYPES
import type { IColorProps } from '~/components/Inputs/ColorInput/types/color-props.type'

// COMPOSITION FUNCTIONS
import { useFieldUtils } from '~/components/Field/functions/useFieldUtils'

// COMPONENTS
import MenuProxy from '~/components/MenuProxy/MenuProxy.vue'

const props = withDefaults(defineProps<IColorProps>(), {
  icon: 'material-symbols:format-color-text-rounded',
})
const emits = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

// UTILS
const { getFieldProps } = useFieldUtils()

// LAYOUT
const menuEl = ref<InstanceType<typeof MenuProxy>>()
const model = useVModel(props, 'modelValue', emits)
const fieldProps = getFieldProps(props)
</script>

<template>
  <Field
    v-bind="fieldProps"
    :no-content="!model"
  >
    <span :style="{ color: model }">
      {{ model || '&nbsp;' }}
    </span>

    <template #append>
      <Btn
        size="sm"
        :icon="icon"
        m="x-2"
        :style="{ color: model }"
      >
        <MenuProxy
          ref="menuEl"
          hide-header
        >
          <ColorBrandingPicker
            v-model="model"
            @update:model-value="menuEl?.hide()"
          />
        </MenuProxy>
      </Btn>
    </template>
  </Field>
</template>
