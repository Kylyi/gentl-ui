<script setup lang="ts">
// TYPES
import type { IRadioProps } from '~/components/Radio/types/radio-props.type'

const props = withDefaults(defineProps<IRadioProps>(), {
  color: 'primary',
  size: 'sm',
})

const emits = defineEmits<{
  (e: 'update:model-value', value: any): void
}>()

// LAYOUT
const isChecked = computed(() => {
  return (
    props.comparatorFn?.(props.modelValue, props.val)
    ?? props.modelValue === props.val
  )
})

function handleCheck() {
  if (!props.disabled) {
    emits('update:model-value', props.val)
  }
}
</script>

<template>
  <label
    tabindex="0"
    class="label"
    :class="[`is-${size}`, { 'is-checked': isChecked, 'is-disabled': disabled }]"
    @keyup.stop.prevent.enter.space="handleCheck"
    @keydown.stop.prevent.enter.space="handleCheck"
    @click="handleCheck"
  >
    <input
      type="radio"
      class="radio"
      tabindex="-1"
      hidden
      :name="name"
      :checked="isChecked"
    >

    <RadioButton
      class="radio"
      :checked="isChecked"
      :class="[`is-${color}`, `is-${size}`]"
    />

    <slot>
      <span
        v-if="label"
        class="radio-label"
        :class="labelClass"
        :style="labelStyle"
      >
        {{ label }}
      </span>
    </slot>

    <span
      v-if="!noHoverEffect"
      class="focus-helper"
    />
  </label>
</template>

<style lang="scss" scoped>
.label {
  @apply flex relative items-center gap-2 cursor-pointer transition-all
    rounded-custom p-x-2 select-none;

  &:hover {
    :deep(.inner.unchecked) {
      @apply scale-100 opacity-60;
    }
  }

  &.is-checked {
    @apply font-semibold;
  }

  &.is-disabled {
    @apply disabled;
  }

  &.is-xs {
    @apply min-h-6;

    .radio-label {
      @apply font-rem-13;
    }
  }

  &.is-sm {
    @apply min-h-8;

    .radio-label {
      @apply font-rem-14 p-y-2px;
    }
  }

  &.is-md {
    @apply min-h-10;

    .radio-label {
      @apply p-y-4px;
    }
  }

  &.is-lg {
    @apply min-h-12;

    .radio-label {
      @apply font-rem-18 p-y-6px;
    }
  }
}

.radio {
  @apply appearance-none relative rounded-full shrink-0 cursor-pointer
    self-start;

  &.is-primary {
    @apply color-primary;
  }

  &.is-secondary {
    @apply color-secondary;
  }

  &.is-positive {
    @apply color-positive;
  }

  &.is-warning {
    @apply color-warning;
  }

  &.is-negative {
    @apply color-negative;
  }

  &.is-info {
    @apply color-info;
  }

  &.is-light {
    @apply color-light;
  }

  &.is-dark {
    @apply color-dark;
  }

  &.is-darker {
    @apply color-darker;
  }

  &.is-xs {
    @apply h-3.5 w-3.5 m-t-5px;
  }

  &.is-sm {
    @apply h-4.5 w-4.5 m-t-7px;
  }

  &.is-md {
    @apply h-5.5 w-5.5 m-t-9px;
  }

  &.is-lg {
    @apply h-6 w-6 m-t-12px;
  }
}

.focus-helper {
  @apply absolute inset-0 z-3 hover:bg-current hover:opacity-10 cursor-pointer
    rounded-inherit;
}
</style>
