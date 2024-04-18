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

// Constants
const relevantColors = [
  'yellow',
  'orange',
  'red',
  'pink',
  'fuchsia',
  'purple',
  'cyan',
  'teal',
  'lightBlue',
  'blue',
  'violet',
  'lime',
  'green',
  'emerald',
  'slate',
  'trueGray',
]

const themeColors = [
  'primary',
  'secondary',
  'tertiary',
  'positive',
  'negative',
  'warning',
  'info',
]

// Layout
const model = defineModel<string>()
const { isSupported, open: openEyeDropper, sRGBHex } = useEyeDropper()

const standardColorsByColumn = computed(() => {
  const _colors = pick(colors, relevantColors)

  return Object.entries(_colors).reduce((agg, [key, value]) => {
    const colorShades = new Set(Object.values(value as any))

    agg[key] = Array.from(colorShades)
    if (agg[key]) {
      agg[key]?.splice(agg[key]!.length - 2, 1)
    }

    // Pick every second color
    agg[key] = agg[key]?.filter((_, i) => i % 2 === 0)

    return agg
  }, {} as Record<string, ISelectorProps['options']>)
})

watch(sRGBHex, value => {
  if (value) {
    model.value = value
  }
})

// Methods
function setColor(color: string, isThemeColor = false) {
  if (isThemeColor) {
    model.value = getColor(color)

    return
  }

  model.value = hexToRgb(color)
}
</script>

<template>
  <div flex="~ col gap-y-3">
    <!-- Theme colors -->
    <div flex="~ col gap-y-px wrap">
      <div text="caption">
        {{ $t('color.theme') }}
      </div>

      <div flex="~ justify-between">
        <div grid="~ flow-col gap-x-px">
          <div
            class="color-block"
            p="x-2"
            w="!fit"
            border="1 ca"
            text="center"
            leading="none"
            flex="~ center"
            @click="model = undefined"
          >
            {{ $t('color.auto') }}
          </div>

          <div
            class="color-block"
            bg="white"
            border="1 ca"
            text="center"
            @click="setColor('#FFFFFF')"
          />

          <div
            class="color-block"
            bg="black"
            text="center"
            @click="setColor('#000000')"
          />

          <div
            v-for="themeColor in themeColors"
            :key="themeColor"
            :style="{ backgroundColor: `var(--color-${themeColor})` }"
            class="color-block"
            @click="setColor(themeColor, true)"
          />
        </div>

        <div grid="~ flow-col gap-x-px">
          <button
            v-if="isSupported"
            class="color-block"
            flex="~ center"
            @click="openEyeDropper()"
          >
            <div class="mdi:eyedropper" />
          </button>
        </div>
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
            @click="setColor(shade)"
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
