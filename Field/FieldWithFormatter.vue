<script setup lang="ts">
// Types
import { type IFieldWithFormatterProps } from '~/components/Field/types/field-with-formatter.type'

// Functions
import { useFieldUtils } from '~/components/Field/functions/useFieldUtils'

const props = defineProps<IFieldWithFormatterProps>()

const { getFieldProps } = useFieldUtils()
const fieldProps = getFieldProps(props)
</script>

<template>
  <Field
    v-bind="fieldProps"
    control-class="break-words whitespace-normal overflow-visible !p-0"
  >
    <ValueFormatter
      :value="modelValue"
      :data-type="dataType"
    >
      <template #default="{ val }">
        {{ val }}
        <template v-if="!val">&nbsp;</template>
      </template>
    </ValueFormatter>

    <template
      v-if="$slots.append"
      #append
    >
      <slot name="append" />
    </template>
  </Field>
</template>

<style scoped lang="scss">
:deep(.wrapper-body__input) {
  --apply: inline-block w-full p-3;
}
</style>
