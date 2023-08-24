<script setup lang="ts">
// Types
import type { IQueryBuilderItem } from '~/components/QueryBuilder/types/query-builder-item-props.type'

// Components
import Menu from '~/components/Menu/Menu.vue'

type IAgoValue = {
  value?: number | null | undefined
  unit: string
  unitShortName: string
}

type IProps = {
  item: Pick<IQueryBuilderItem, 'value' | 'comparator'>
}

const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'update:modelValue', val: any): void
}>()

// Layout
const menuEl = ref<InstanceType<typeof Menu>>()
const item = toRef(props, 'item')

const units = computed(() => [
  { id: 'd', label: $t('general.day', agoValue.value.value ?? 0) },
  { id: 'w', label: $t('general.week', agoValue.value.value ?? 0) },
  { id: 'm', label: $t('general.month', agoValue.value.value ?? 0) },
  { id: 'y', label: $t('general.year', agoValue.value.value ?? 0) },
])

// ComapratorEnum.AGO, CoparatorEnum.NOT_AGO, ComparatorEnum.UNTIL, ComparatorEnum.NOT_UNTIL
const agoValue = computed({
  get() {
    const matches = (item.value.value || '').match(/(\d+\.\d+|\d+)([a-zA-Z]+)/)
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

    return { value, unit, unitShortName }
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

function setUnit(unitShortName: string) {
  agoValue.value = {
    unitShortName: isExact.value ? `${unitShortName}e` : unitShortName,
  }

  menuEl.value?.hide()
}
</script>

<template>
  <NumberInput
    :model-value="agoValue.value"
    size="sm"
    class="qb-item__content-value"
    @update:model-value="agoValue = { value: $event }"
  >
    <template #append>
      <div flex="~ gap-1">
        <Btn
          flex="shrink"
          :label="
            $t(`general.${agoValue.unit}`, agoValue.value || 0).toLowerCase()
          "
          size="xs"
          no-uppercase
          no-bold
          color="ca"
          tabindex="-1"
          w="16"
          @mousedown.stop.prevent=""
        >
          <Menu
            ref="menuEl"
            hide-header
            content-class="gap-y-1 w-40"
            cover
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
          @click="isExact = !isExact"
        />
      </div>
    </template>
  </NumberInput>
</template>
