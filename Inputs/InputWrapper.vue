<script setup lang="ts">
// TYPES
import type { IInputWrapperProps } from '~~/components/Inputs/types/input-wrapper-props.type'

// COMPOSITION FUNCTIONS
import { useInputWrapperUtils } from '~/components/Inputs/functions/useInputWrapperUtils'

const props = withDefaults(defineProps<IInputWrapperProps>(), {
  cursor: 'cursor-text',
  errorVisible: true,
  size: 'md',
})

// UTILS
const { getInputWrapperStyleVariables } = useInputWrapperUtils()

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

const wrapperStyleVariables = computedEager(() =>
  getInputWrapperStyleVariables(props)
)

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
    :style="wrapperStyleVariables"
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
    &.is-inline {
      .wrapper-body::after {
        --apply: lt-md:top-17.5px;
      }
    }
  }

  &--md {
    &.is-inline {
      .wrapper-body::after {
        --apply: lt-md:top-17.5px;
      }
    }
  }

  &--lg {
    &.is-inline {
      .wrapper-body::after {
        --apply: lt-md:top-20px;
      }
    }
  }

  .wrapper-body {
    --apply: dark:bg-darker bg-white;
    --apply: relative grid;
    margin: var(--bodyMargin);

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
    --apply: flex items-center rounded-custom;

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
      --apply: bg-inherit outline-none rounded-custom;
      // --apply: p-x-3;

      font-size: var(--fontSize);
      line-height: var(--lineHeight);
      padding: var(--padding);
      margin: var(--margin);
    }
  }

  &:not(.has-content) {
    :slotted(.control) {
      --apply: color-true-gray-400;
    }

    &:not(:focus-within) {
      :slotted(.control) {
        --apply: "!color-transparent";
      }

    }
  }
}
</style>
