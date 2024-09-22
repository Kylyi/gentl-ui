<script setup lang="ts">
// Types
import type { IQueryBuilderItem } from '~/components/QueryBuilder/types/query-builder-item-props.type'

// Components
import Menu from '~/components/Menu/Menu.vue'
import NumberInput from '~/components/Inputs/NumberInput/NumberInput.vue'

type IAgoValue = {
  value?: number | null | undefined
  unit: string
  unitShortName: string
}

type IExactInputProps = {
  /**
   * The initial value for `isExact` input
   */
  value: boolean
  /**
   * Indicates should exact selection button be disabled
   */
  isButtonDisabled?: boolean
}

type IProps = {
  item: Pick<IQueryBuilderItem, 'value' | 'comparator'>
  exactInputOptions?: IExactInputProps
}

const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'update:modelValue', val: any): void
}>()

defineExpose({
  focus: () => inputEl.value?.focus(),
})

// Layout
const inputEl = ref<InstanceType<typeof NumberInput>>()
const menuEl = ref<InstanceType<typeof Menu>>()
const item = toRef(props, 'item')
const exactInputOptions = toRef(props, 'exactInputOptions')

const units = computed(() => [
  { id: 'd', label: $t('general.day', agoValue.value.value ?? 0) },
  { id: 'w', label: $t('general.week', agoValue.value.value ?? 0) },
  { id: 'm', label: $t('general.month', agoValue.value.value ?? 0) },
  { id: 'y', label: $t('general.year', agoValue.value.value ?? 0) },
])

// ComapratorEnum.AGO, CoparatorEnum.NOT_AGO, ComparatorEnum.UNTIL, ComparatorEnum.NOT_UNTIL
const agoValue = computed({
  get() {
    const matches = (item.value.value || '').match(/(\d+\.\d+|\d+)([a-z]+)/i)
    let value: number | undefined
    let unit: string
    const unitShortName = matches?.[2] as string

    if (matches) {
      value = Number.parseFloat(matches[1])

      if (unitShortName === 'd' || unitShortName === 'de') {
        unit = 'day'
      } else if (unitShortName === 'w' || unitShortName === 'we') {
        unit = 'week'
      } else if (unitShortName === 'm' || unitShortName === 'me') {
        unit = 'month'
      } else {
        unit = 'year'
      }
    } else {
      unit = 'month'
    }

    return { value, unit, unitShortName } as Partial<IAgoValue>
  },
  set({ value, unitShortName }: Partial<IAgoValue>) {
    item.value.value = `${value ?? agoValue.value.value}${
      unitShortName || agoValue.value.unitShortName
    }`

    emits('update:modelValue', item.value.value)
  },
})

const isExact = computed({
  get() {
    return !!agoValue.value?.unitShortName?.endsWith('e')
  },
  set(val: boolean) {
    if (val) {
      agoValue.value = {
        unitShortName: `${agoValue.value.unitShortName}e`,
      }
    } else {
      agoValue.value = {
        unitShortName: agoValue.value.unitShortName?.replace(/e$/, ''),
      }
    }
  },
})

// Set isExact value from exactInputOptions props, if provided
if (exactInputOptions.value?.value && exactInputOptions.value.value !== isExact.value) {
  isExact.value = exactInputOptions.value.value
}

function setUnit(unitShortName: string) {
  agoValue.value = {
    unitShortName: isExact.value ? `${unitShortName}e` : unitShortName,
  }

  menuEl.value?.hide()
}
</script>

<template>
  <NumberInput
    ref="inputEl"
    :model-value="agoValue.value"
    size="sm"
    layout="regular"
    :mask="{ mask: /^\d+$/ }"
    class="qb-item__content-value"
    @update:model-value="agoValue = { value: $event }"
  >
    <template #append>
      <div flex="~ gap-1">
        <Btn
          flex="shrink"
          :label="$t(`general.${agoValue.unit}`, Math.round(agoValue.value ?? 0) || 0).toLowerCase()"
          size="xs"
          no-uppercase
          no-bold
          color="ca"
          tabindex="-1"
          w="16"
          @click.stop.prevent
          @mousedown.stop.prevent
        >
          <Menu
            ref="menuEl"
            w="40"
            :fit="false"
          >
            <template #default>
              <Btn
                v-for="unit in units"
                :key="unit.id"
                :label="unit.label"
                size="sm"
                no-bold
                no-uppercase
                @click="setUnit(unit.id)"
                @mousedown.stop.prevent=""
              />
            </template>
          </Menu>
        </Btn>

        <Btn
          size="xs"
          :class="{
            'color-white !bg-primary': isExact,
            'color-ca': !isExact,
          }"
          no-bold
          no-uppercase
          :label="$t('table.exactFilter')"
          :disabled="exactInputOptions?.isButtonDisabled"
          @click="isExact = !isExact"
        />
      </div>
    </template>
  </NumberInput>
</template>
