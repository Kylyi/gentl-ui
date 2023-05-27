<script setup lang="ts">
import { CSSProperties } from 'vue'

type IProps = {
  modelValue: string
  size?: 'sm' | 'md' | 'lg'
  inputStyle: CSSProperties
  contentStyle: CSSProperties
}

const props = defineProps<IProps>()

const sizeClass = computedEager(() => {
  switch (props.size) {
    case 'sm':
      return 'font-rem-14'

    case 'lg':
      return 'font-rem-18'

    case 'md':
    default:
      return 'font-rem-16'
  }
})
</script>

<template>
  <div
    class="label"
    :class="[sizeClass]"
    :style="[inputStyle, contentStyle]"
  >
    {{ modelValue }}
  </div>
</template>

<style lang="scss" scoped>
.label {
  --apply: rounded-custom fit dark:bg-darker bg-white p-x-1;
}
</style>
