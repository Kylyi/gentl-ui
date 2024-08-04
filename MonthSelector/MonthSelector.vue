<script setup lang="ts">
// Types
import { type IMonthSelectorProps } from '~/components/MonthSelector/types/month-selector-props.type'

type Month = {
  idx: number
  idxString: string
}

const props = defineProps<IMonthSelectorProps>()
const emits = defineEmits<{
  (e: 'month', payload: Month): void
  (e: 'previous'): void
  (e: 'next'): void
}>()

// Utils
const { $bp } = useNuxtApp()
const { formatDate } = useDateUtils()

// Layout
const now = useNow({ interval: $duration(15, 'minute').as('ms') })
const nowMonth = computed(() => {
  const dateObj = $date(now.value)

  return `${dateObj.year()}-${dateObj.month()}`
})

const monthBtn = ref<any>()
const monthSelectorVisible = ref(false)

const dateObj = computed(() => $date(props.modelValue))

const months = computed(() => {
  return Array.from({ length: 12 }, (_, idx) => {
    const idxString = padStart(String(idx), 2, '0')
    const date = $date(
      `${dateObj.value.year()}-${padStart(String(idx + 1), 2, '0')}-01`
    )

    return {
      idx,
      idxString,
      date: date.valueOf(),
      month: `${date.year()}-${date.month()}`,
    }
  })
})

function handleMonthSelect(month: Month, callback?: () => void) {
  emits('month', month)
  callback?.()
}
</script>

<template>
  <div class="month-selector">
    <!-- Previous -->
    <Btn
      size="auto"
      class="month-selector__previous"
      tabindex="-1"
      icon="i-majesticons:chevron-left"
      @click="$emit('previous')"
      @mousedown.stop.prevent=""
    />

    <!-- Current month -->
    <Btn
      ref="monthBtn"
      size="sm"
      self-center
      flex="1"
      h="8"
      tabindex="-1"
      :label="formatDate(dateObj.valueOf(), 'month')"
    />

    <!-- Next -->
    <Btn
      size="auto"
      class="month-selector__next"
      tabindex="-1"
      icon="i-majesticons:chevron-right"
      @click="$emit('next')"
      @mousedown.stop.prevent
    />

    <Menu
      v-model="monthSelectorVisible"
      :fit="false"
      no-uplift
      :target="monthBtn"
      :reference-target="
        $bp.isGreaterOrEqual('xm') ? referenceTarget : undefined
      "
    >
      <template #default="{ hide }">
        <div grid="~ cols-2 xm:cols-3 gap-1">
          <Btn
            v-for="m in months"
            :key="m.idx"
            :label="formatDate(m.date, 'month')"
            capitalize
            tabindex="-1"
            size="sm"
            :class="{
              'bg-primary color-white': dateObj.month() === m.idx,
              'border-2 border-ca':
                nowMonth === m.month && dateObj.month() !== m.idx,
            }"
            @click="handleMonthSelect(m, hide)"
            @mousedown.stop.prevent
          />
        </div>
      </template>
    </Menu>
  </div>
</template>

<style lang="scss" scoped>
.month-selector {
  --apply: flex flex-gap-x-1 items-center;

  &__previous,
  &__next {
    --apply: w-8 h-8 p-3;
    --apply: '!lt-xs:hidden';
  }
}
</style>
