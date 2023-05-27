<script setup lang="ts">
// TYPES
import type { IInputWrapperProps } from '~~/components/Inputs/types/input-wrapper-props.type'

const props = withDefaults(defineProps<IInputWrapperProps>(), {
  cursor: 'cursor-text',
  errorVisible: true,
  size: 'md',
})

// LAYOUT
const wrapperEl = ref<HTMLDivElement>()
const errorContainerPaddingLeft = ref('8px')
const currentInstance = getCurrentInstance()

const labelProps = computedEager(() => {
  return {
    hasContent: props.hasContent,
    hasError: !!props.errors?.length,
    inline: props.inline,
    label: props.label,
    labelClass: props.labelClass,
    labelInside: props.labelInside,
    labelStyle: props.labelStyle,
    placeholder: props.placeholder,
    required: props.required,
    size: props.size,
    stackLabel: props.stackLabel,
  }
})

const wrapperClass = computedEager(() => {
  return [
    `wrapper--${props.size}`,
    props.cursor,
    {
      'has-content': props.hasContent,
      'has-label-inside': props.labelInside,
      'is-inline': props.inline,
    },
  ]
})

const wrapperContentClass = computedEager(() => {
  return {
    'is-readonly': props.readonly,
    'is-disabled': props.disabled,
    'has-error': props.errors?.length,
    'has-label': !!props.label,
    'has-border': !props.noBorder,
  }
})

function getErrorContainerPosition() {
  const instanceEl = currentInstance?.vnode.el

  if (!instanceEl) {
    return
  }

  const inputEl = instanceEl.querySelector('.control')
  const instanceElX = instanceEl.getBoundingClientRect().x
  const inputElX = inputEl.getBoundingClientRect().x

  const diffX = inputElX - instanceElX
  errorContainerPaddingLeft.value = `${diffX || 8}px`
}

useResizeObserver(wrapperEl, getErrorContainerPosition)
</script>

<template>
  <div
    ref="wrapperEl"
    class="wrapper"
    :class="wrapperClass"
  >
    <div
      class="wrapper-body"
      :class="[contentClass, wrapperContentClass]"
      :style="contentStyle"
    >
      <span
        v-if="$slots.prepend"
        class="prepend"
      >
        <slot name="prepend" />
      </span>

      <span class="wrapper-body__input">
        <slot />
      </span>

      <InputLabel
        v-if="label"
        v-bind="labelProps"
      />

      <span
        v-if="$slots.append"
        class="append"
      >
        <slot name="append" />
      </span>

      <LoaderBlock
        v-if="loading"
        :size="7"
        m="x-2"
        class="loading"
      />
    </div>

    <ErrorContainer
      v-if="errorVisible"
      :error-takes-space="errorTakesSpace"
      :errors="errors"
      class="wrapper-error"
      :style="{ paddingLeft: errorContainerPaddingLeft }"
    />

    <HintContainer
      v-if="!errors?.length && hint"
      :hint="hint"
      :style="{ paddingLeft: errorContainerPaddingLeft }"
    />

    <slot name="menu" />
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  --apply: flex flex-col;

  &--sm {
    :slotted(.control) {
      --apply: p-y-1 font-rem-14 leading-6;
    }

    &.is-inline {
      .wrapper-body::after {
        --apply: lt-md:top-17.5px;
      }
    }
  }

  &--md {
    :slotted(.control) {
      --apply: p-y-2;
    }

    &.is-inline {
      .wrapper-body::after {
        --apply: lt-md:top-17.5px;
      }
    }
  }

  &--lg {
    :slotted(.control) {
      --apply: p-y-3 font-rem-18 leading-7;
    }

    &.is-inline {
      .wrapper-body::after {
        --apply: lt-md:top-20px;
      }
    }
  }

  .wrapper-body {
    --apply: dark:bg-darker bg-white;
    --apply: relative grid;

    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto 1fr;
    grid-template-areas:
      "nothing label nothing2 nothing3"
      "prepend input append   loading";

    .prepend {
      grid-area: prepend;
    }

    .append {
      grid-area: append;
    }

    .wrapper-body__input {
      grid-area: input;
    }

    .label {
      grid-area: label;
    }

    .loading {
      grid-area: loading;
    }

    &.has-border::after {
      --apply: content-empty absolute inset-0 transition-all
      border-custom rounded-custom pointer-events-none;
    }

    &::after {
      --apply: border-ca;
    }

    &:focus-within::after {
      --apply: border-primary;
    }

    &.has-error::after {
      --apply: border-negative;
    }

  }

  &.is-inline {
    .wrapper-body {
      @media screen and (min-width: 768px) {
        grid-template-columns: auto auto 1fr auto;
        grid-template-areas:
          "label prepend input append loading"
      }

      &::after {
        --apply: md:top-0 md:left-200px;
      }
    }
  }

  &-body {
    --apply: flex items-center;

    &__input {
      --apply: flex lt-md:flex-col relative grow gap-x-2 gap-y-1px overflow-auto;
    }

    &.is-readonly,
    &.is-disabled {
      :slotted(.control) {
        --apply: cursor-default;
      }

      &::after {
        --apply: border-dashed;
      }
    }

    :slotted(.control) {
      --apply: bg-inherit p-x-3 outline-none;
    }
  }

  &.has-label-inside {
    &.wrapper--sm {
      :slotted(.control) {
        --apply: m-t-20px m-b-0 p-y-0;
      }

      .wrapper-body:not(.has-label) {
        :slotted(.control) {
          --apply: m-t-10px m-b-10px;
        }
      }
    }

    &.wrapper--md {
      :slotted(.control) {
        --apply: m-t-21px m-b-3px p-y-0;
      }

      .wrapper-body:not(.has-label) {
        :slotted(.control) {
          --apply: m-t-12px m-b-12px;
        }
      }
    }

    &.wrapper--lg {
      :slotted(.control) {
        --apply: m-t-24px m-b-4px p-y-0;
      }

      .wrapper-body:not(.has-label) {
        :slotted(.control) {
          --apply: m-t-14px m-b-14px;
        }
      }
    }
  }

  &:not(.has-content) {
    :slotted(.control) {
      --apply: color-true-gray-400;
    }

    &:not(:focus-within) {
      :slotted(.control) {
        --apply: color-transparent;
      }

    }
  }
}
</style>
