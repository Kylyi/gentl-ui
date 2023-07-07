<script setup lang="ts">
// TYPES
import type { InputLabelProps } from '~~/components/Inputs/types/input-label-props.type'

const props = defineProps<InputLabelProps>()

const labelLocalClass = computedEager(() => {
  return [
    props.labelClass,
    `label--${props.size}`,
    {
      'is-inline': props.inline,
      'is-required': props.required,
      'is-inside': props.labelInside,
      'is-floating':
        !props.inline &&
        (props.stackLabel || props.placeholder || props.hasContent),
    },
  ]
})
</script>

<template>
  <span
    class="label"
    :class="labelLocalClass"
    :style="labelStyle"
  >
    {{ label }}
  </span>
</template>

<style lang="scss" scoped>
span.label {
  --apply: ease-linear tracking-wide z-10 origin-top-left top-0 left-0 pointer-events-none
    leading-tight md:self-center color-gray-500 dark:color-gray-400 max-w-full;

  transition: transform .36s cubic-bezier(.4,0,.2,1),
              max-width .2s  cubic-bezier(.4,0,.2,1) .2s,
              color     .2s  linear;

  &.is-inline {
    --apply: order--1 min-w-200px md:w-200px md:text-right lt-md:scale-80;
  }

  &:not(.is-inline) {
    --apply: absolute origin-top-left left-0 top-0 truncate w-full;
  }

  &--sm,
  &--md,
  &--lg {
    --apply: p-x-3;
  }

  &--sm {
    --apply: font-rem-14 leading-3.5;

    &:not(.is-inline) {
      --apply: top-2;
    }

    &.is-inside {
      --apply: top-2.5;
    }

    &.is-inline {
      --apply: self-start md:p-t-2 md:p-b-1;
    }
  }

  &--md {
    --apply: font-rem-14 leading-4;

    &:not(.is-inline) {
      --apply: top-3;
    }

    &.is-inside {
      --apply: top-3.5;
    }

    &.is-inline {
      --apply: self-start md:p-t-3 md:p-b-1;
    }
  }

  &--lg {
    --apply: font-rem-16;

    &:not(.is-inline) {
      --apply: top-4;
    }

    &.is-inside {
      --apply: top-4;
    }

    &.is-inline {
      --apply: self-start md:p-t-18px md:p-b-1;
    }
  }

  &.is-floating:not(.is-inline) {
    --apply: translate-y--180% w-125% max-w-125% scale-80;

    &.is-inside {
      --apply: translate-y--65%;
    }
  }

  &.is-required::after {
    content: ' *';
    --apply: color-negative;
  }
}

.wrapper-body:focus-within {
  > .label {
    --apply: color-primary;

    &:not(.is-inline) {
      --apply: translate-y--180% w-125% max-w-125% scale-80;

      &.is-inside {
        --apply: translate-y--65% rounded-tl;
      }
    }
  }

  > .label[haserror="true"] {
    --apply: color-negative;
  }
}
</style>
