<script setup lang="ts">
// Types
import type { IInputWrapperProps } from '~/components/Inputs/types/input-wrapper-props.type'

const props = defineProps<
  Pick<
    IInputWrapperProps,
    'noBorder' | 'readonly' | 'disabled' | 'size' | 'hint'
  > & {
    hasErrors?: boolean
  }
>()

// Layout
const classes = computed(() => {
  return {
    'has-border': !props.noBorder,
    'has-errors': props.hasErrors,
    'is-readonly': props.readonly,
    'is-disabled': props.disabled,
  }
})
</script>

<template>
  <div
    class="input-wrapper__regular"
    :class="classes"
  >
    <div
      v-if="$slots.label"
      class="input-wrapper__regular-label"
    >
      <slot name="label" />
    </div>

    <div class="input-wrapper__regular-prepend">
      <slot name="prepend" />
    </div>

    <div class="input-wrapper__regular-input input-wrapper__input">
      <slot name="input" />
    </div>

    <div class="input-wrapper__regular-loading">
      <slot name="loading" />
    </div>

    <div class="input-wrapper__regular-append">
      <slot name="append" />
    </div>

    <div
      v-if="$slots.error || hint"
      class="input-wrapper__reular-error"
    >
      <slot
        v-if="hasErrors"
        name="error"
      />
      <slot
        v-else-if="hint"
        name="hint"
      />
    </div>

    <div class="input-wrapper__regular-border" />
  </div>
</template>

<style lang="scss" scoped>
.input-wrapper__regular {
  --apply: grid items-center;

  grid-template-areas:
    'nothing  input nothing2 nothing3'
    'prepend  input loading append'
    'nothing4 error nothing5 nothing6';

  grid-template-columns: auto 1fr auto auto;
  grid-template-rows: 16px auto 1fr;

  .input-wrapper__regular-input,
  .input-wrapper__regular-label {
    --apply: relative flex overflow-auto;
    grid-area: input;
  }

  .input-wrapper__regular-prepend {
    grid-area: prepend;
  }

  .input-wrapper__regular-loading {
    grid-area: loading;
  }

  .input-wrapper__regular-append {
    grid-area: append;
  }

  .input-wrapper__reular-error {
    --apply: p-x-3;
    grid-area: error;
  }
}

// Border
.input-wrapper__regular-border {
  grid-column: 1 / -1;
  grid-row: 2 / 3;

  --apply: fit transition-all border-custom rounded-custom pointer-events-none
    border-ca;
}
.input-wrapper__regular:focus-within {
  .input-wrapper__regular-border {
    --apply: border-$borderColor;
  }
}

.input-wrapper__regular.has-errors > .input-wrapper__regular-border {
  --apply: border-negative;
}

.input-wrapper__regular.is-readonly > .input-wrapper__regular-border {
  --apply: border-dashed;
}

.input-wrapper__regular.is-disabled {
  --apply: opacity-80 cursor-not-allowed;

  :slotted(.control) {
    --apply: '!cursor-not-allowed';
  }
}
</style>
