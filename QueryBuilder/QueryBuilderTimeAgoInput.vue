<script setup lang="ts">
// Types
import type { IQueryBuilderItem } from '~/components/QueryBuilder/types/query-builder-item-props.type'

// Components
import Menu from '~/components/Menu/Menu.vue'

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

      if (unitShortName === 'd') {
        unit = 'day'
      } else if (unitShortName === 'w') {
        unit = 'week'
      } else if (unitShortName === 'm') {
        unit = 'month'
      } else {
        unit = 'year'
      }
    } else {
      unit = 'month'
    }

    return { value, unit, unitShortName }
  },
  set({ value, unit }: { value?: number | null | undefined; unit?: string }) {
    item.value.value = `${value ?? agoValue.value.value}${
      // @ts-expect-error
      unit || agoValue.value.unitShortName
    }`

    emits('update:modelValue', item.value.value)
  },
})

function setUnit(unit: string) {
  agoValue.value = { unit }

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
    </template>
  </NumberInput>
</template>
