<script setup lang="ts">
// Types
import type { IDurationInputProps } from '~/components/Inputs/DurationInput/types/input-duration-props.type'

// Functions
import {
  type DurationUnit,
  MODIFIER_BY_UNIT,
  useDuration,
} from '~/components/Inputs/DurationInput/functions/useDuration'

// Components
import Btn from '~/components/Button/Btn.vue'
import Menu from '~/components/Menu/Menu.vue'
import NumberInput from '~/components/Inputs/NumberInput/NumberInput.vue'

const props = withDefaults(defineProps<IDurationInputProps>(), {
  allowedUnits: () => ['minute', 'hour', 'day'],
  initialDurationUnit: 'hour',
  inline: undefined,
  labelInside: undefined,
  required: undefined,
  stackLabel: undefined,
  errorVisible: undefined,
})

const emits = defineEmits<{
  (e: 'update:modelValue', val?: any): void
  (e: 'blur'): void
}>()

const { getDuration } = useDuration()

// Layout
const numberInputEl = ref<ComponentInstance<typeof NumberInput>>()
const menuEl = ref<InstanceType<typeof Menu>>()
const durationUnit = ref<DurationUnit>(props.initialDurationUnit)

const numberInputProps = reactivePick(
  props,
  'autofocus',
  'debounce',
  'disabled',
  'emptyValue',
  'validation',
  'errorTakesSpace',
  'errorVisible',
  'fractionDigits',
  'hint',
  'immediate',
  'inputClass',
  'inputStyle',
  'label',
  'layout',
  'loading',
  'min',
  'max',
  'name',
  'noBorder',
  'placeholder',
  'readonly',
  'required',
  'size',
  'stackLabel',
  'step',
  'inputProps',
  'ui',
  'zod',
)

const modelByUnit = computed<Record<DurationUnit, number>>(() => {
  const model = typeof props.modelValue === 'number' ? props.modelValue : 0

  return {
    year: getDuration(model, 'year').val,
    month: getDuration(model, 'month').val,
    week: getDuration(model, 'week').val,
    day: getDuration(model, 'day').val,
    hour: getDuration(model, 'hour').val,
    minute: getDuration(model, 'minute').val,
    second: getDuration(model, 'second').val,
    millisecond: getDuration(model, 'millisecond').val,
  }
})

const model = computed({
  get() {
    return props.emptyValue === props.modelValue
      ? props.emptyValue
      : modelByUnit.value[durationUnit.value]
  },
  set(val) {
    let duration: any

    if (typeof val === 'number') {
      duration = val * MODIFIER_BY_UNIT[durationUnit.value]
    } else {
      duration = val
    }

    emits('update:modelValue', duration)
  },
})

// Units
const units = computed(() => {
  return props.allowedUnits.map(unit => ({
    id: unit,
    label: $t(`general.${unit}`, model.value),
    class: durationUnit.value === unit ? 'bg-primary color-white' : '',
    handler: () => handleDurationUnitChange(unit),
  }))
})

function handleDurationUnitChange(unit: DurationUnit) {
  const isEmptyValue = props.emptyValue === model.value
  durationUnit.value = unit

  nextTick(() => {
    model.value = isEmptyValue ? props.emptyValue : modelByUnit.value[unit]
  })

  menuEl.value?.hide()
}

defineExpose({
  focus: () => numberInputEl.value?.focus(),
  select: () => numberInputEl.value?.select(),
  blur: () => numberInputEl.value?.blur(),
})
</script>

<template>
  <NumberInput
    ref="numberInputEl"
    v-model="model"
    v-bind="numberInputProps"
    :zod="zod"
  >
    <template v-if="$slots.prepend">
      <slot name="prepend" />
    </template>

    <template #append>
      <slot name="append" />

      <!-- Unit selection -->
      <Btn
        v-if="!readonly && !disabled"
        flex="shrink"
        :label="$t(`general.${durationUnit}`, model).toLowerCase()"
        size="xs"
        no-uppercase
        no-bold
        color="ca"
        tabindex="-1"
        @mousedown.stop.prevent
        @click.stop.prevent
      >
        <Menu
          ref="menuEl"
          cover
          no-transition
          :fit="false"
          :ui="{ contentClass: 'gap-1 w-35 p-1' }"
        >
          <template #default>
            <Btn
              v-for="unit in units"
              :key="unit.id"
              :label="unit.label"
              :class="unit.class"
              size="sm"
              no-bold
              no-uppercase
              @click="unit.handler"
              @mousedown.stop.prevent
            />
          </template>
        </Menu>
      </Btn>
    </template>
  </NumberInput>
</template>
