<script setup lang="ts">
import { colors } from '@unocss/preset-mini'

// TYPES
import type { ISelectorProps } from '~/components/Selector/types/selector-props.type'

type IProps = {
  modelValue?: string
}

defineProps<IProps>()
const emits = defineEmits<{
  (e: 'update:modelValue', val: string | undefined): void
}>()

const relevantColors = [
  'yellow',
  'orange',
  'red',
  'rose',
  'pink',
  'fuchsia',
  'purple',
  'cyan',
  'teal',
  'lightBlue',
  'blue',
  'indigo',
  'violet',
  'lime',
  'green',
  'emerald',
  'gray',
  'neutral',
  'slate',
  'trueGray',
]

const themeColors = [
  'var(--color-primary)',
  'var(--color-secondary)',
  'var(--color-tertiary)',
  'var(--color-positive)',
  'var(--color-negative)',
  'var(--color-warning)',
  'var(--color-info)',
]

const standardColorsByColumn = computedEager(() => {
  const _colors = pick(colors, relevantColors)

  return Object.entries(_colors).reduce((agg, [key, value]) => {
    const colorShades = new Set(Object.values(value as any))

    agg[key] = Array.from(colorShades)
    if (agg[key]) {
      agg[key]?.splice(agg[key]!.length - 2, 1)
    }

    return agg
  }, {} as Record<string, ISelectorProps['options']>)
})

function handleSelectColor(color?: string) {
  emits('update:modelValue', color)
}
</script>

<template>
  <div flex="~ col gap-y-3">
    <!-- Theme colors -->
    <div flex="~ gap-y-px wrap">
      <div
        w="full"
        text="caption"
      >
        {{ $t('color.theme') }}
      </div>

      <div grid="~ flow-col gap-x-px">
        <div
          class="color-block"
          p="x-2"
          w="!fit"
          border="1 ca"
          rounded="custom"
          text="center"
          @click="handleSelectColor()"
        >
          {{ $t('color.auto') }}
        </div>

        <div
          class="color-block"
          bg="white"
          border="1 ca"
          text="center"
          @click="handleSelectColor('white')"
        />

        <div
          class="color-block"
          bg="black"
          text="center"
          @click="handleSelectColor('black')"
        />

        <div
          v-for="themeColor in themeColors"
          :key="themeColor"
          :style="{ backgroundColor: themeColor }"
          class="color-block"
          @click="handleSelectColor(themeColor)"
        />
      </div>
    </div>

    <!-- Standard colors -->
    <div flex="~ col">
      <div
        w="full"
        text="caption"
      >
        {{ $t('color.standard') }}
      </div>

      <div grid="~ gap-x-px flow-col">
        <div
          v-for="(shades, colorKey) in standardColorsByColumn"
          :key="colorKey"
          grid="~ gap-y-px"
        >
          <div
            v-for="shade in shades"
            :key="shade"
            :style="{ backgroundColor: shade }"
            class="color-block"
            @click="handleSelectColor(shade)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.color-block {
  --apply: h-6 w-6 hover:shadow-consistent shadow-ca hover:z-1 cursor-pointer;
}
</style>
