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
    [`is-${props.size}`]: true,
    'has-border': !props.noBorder,
    'has-errors': props.hasErrors,
    'is-readonly': props.readonly,
    'is-disabled': props.disabled,
  }
})
</script>

<template>
  <div
    class="input-wrapper__inside"
    :class="classes"
  >
    <div class="input-wrapper__inside-prepend">
      <slot name="prepend" />
    </div>

    <div class="input-wrapper__inside-input input-wrapper__input">
      <slot name="input" />
    </div>

    <div class="input-wrapper__inside-loading">
      <slot name="loading" />
    </div>

    <div class="input-wrapper__inside-append">
      <slot name="append" />
    </div>

    <!-- Label -->
    <div
      v-if="$slots.label"
      class="input-wrapper__inside-label"
    >
      <slot name="label" />
    </div>

    <!-- Errors -->
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

    <!-- Border -->
    <div class="input-wrapper__inside-border" />
  </div>
</template>

<style lang="scss" scoped>
.input-wrapper__inside {
  --apply: grid items-center;

  grid-template-areas:
    'prepend input loading append'
    'prepend input loading append'
    'nothing error nothing2 nothing3';

  grid-template-columns: auto 1fr auto auto;
  grid-template-rows: auto 1fr auto;

  &.is-sm {
    --apply: min-h-9;
  }

  &.is-md {
    --apply: min-h-11;
  }

  &.is-lg {
    --apply: min-h-13;
  }

  .input-wrapper__inside-label {
    --apply: fit overflow-hidden;
    grid-column: 2 / 3;
    grid-row: 1 / 3;
  }

  .input-wrapper__inside-input {
    --apply: flex relative h-full;
    grid-area: input;
  }

  .input-wrapper__inside-prepend {
    grid-area: prepend;
  }

  .input-wrapper__inside-loading {
    grid-area: loading;
  }

  .input-wrapper__inside-append {
    grid-area: append;
  }

  .input-wrapper__reular-error {
    --apply: p-x-3;
    grid-area: error;
  }
}

// Border
.input-wrapper__inside-border {
  grid-column: 1 / -1;
  grid-row: 2 / 3;

  --apply: content-empty absolute fit transition-all border-custom
    rounded-custom pointer-events-none border-ca;
}
.input-wrapper__inside:focus-within {
  .input-wrapper__inside-border {
    --apply: border-$borderColor;
  }
}

.input-wrapper__inside.has-errors > .input-wrapper__inside-border {
  --apply: border-negative;
}

.input-wrapper__inside.is-readonly > .input-wrapper__inside-border {
  --apply: border-dashed;
}

.input-wrapper__inside.is-disabled {
  --apply: opacity-80 cursor-not-allowed;

  :slotted(.control) {
    --apply: '!cursor-not-allowed';
  }
}

// Height of input based on size
.input-wrapper__inside {
  &.is-sm > .input-wrapper__inside-input {
    --apply: min-h-40px;
  }

  &.is-md > .input-wrapper__inside-input {
    --apply: min-h-48px;
  }

  &.is-lg > .input-wrapper__inside-input {
    --apply: min-h-56px;
  }
}
</style>
