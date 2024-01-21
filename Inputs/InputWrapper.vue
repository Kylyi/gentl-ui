<script setup lang="ts">
import { config } from '~/config'

// Types
import type { IInputWrapperProps } from '~/components/Inputs/types/input-wrapper-props.type'

// Functions
import { useInputWrapperUtils } from '~/components/Inputs/functions/useInputWrapperUtils'
import { useInputValidationUtils } from '~/components/Inputs/functions/useInputValidationUtils'

const props = withDefaults(defineProps<IInputWrapperProps>(), {
  cursor: 'cursor-text',
  errorVisible: true,
  size: 'md',
  stackLabel: config.inputs.stackLabel,
  labelInside: config.inputs.labelInside,
  inline: config.inputs.inline,
  required: undefined,
})

// Utils
const { getInputWrapperStyleVariables } = useInputWrapperUtils()
const { issues } = useInputValidationUtils(props)

// Layout
const wrapperEl = ref<HTMLDivElement>()
const errorContainerPaddingLeft = ref('8px')
const currentInstance = getCurrentInstance()

const isModified = computed(() => {
  if (!props.originalValue) {
    return false
  }

  return !isEqual(props.originalValue, props.modelValue)
})

const labelProps = computedEager(() => {
  return {
    hasContent: props.hasContent,
    hasError: !!issues.value.length,
    inline: props.inline,
    label: props.label,
    labelClass: props.labelClass,
    labelInside: props.labelInside,
    labelStyle: props.labelStyle,
    placeholder: props.placeholder,
    required: props.required,
    size: props.size,
    stackLabel: props.stackLabel,
    validation: props.validation,
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
    'has-error': !!issues.value.length,
    'has-label': !!props.label,
    'has-border': !props.noBorder,
    'is-modified': isModified.value,
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

      <span
        class="wrapper-body__input"
        :class="inputContainerClass"
        :style="inputContainerStyle"
        data-cy="input-field"
      >
        <div
          v-if="isModified"
          class="wrapper-body__input-modified"
        >
          <div class="eos-icons:diff-modified-outlined w-3 h-3 color-warning" />

          <Tooltip
            :offset="4"
            placement="left"
            dense
          >
            <span
              color="warning"
              text="xs"
              p="x-1 y-0.5"
              >{{ $t('general.modified') }}</span
            >
          </Tooltip>
        </div>

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
      :errors="issues"
      class="wrapper-error"
      :style="{ paddingLeft: errorContainerPaddingLeft }"
    />

    <HintContainer
      v-if="!issues?.length && hint"
      :hint="hint"
      :style="{ paddingLeft: errorContainerPaddingLeft }"
    />

    <slot name="menu" />
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  --apply: relative flex flex-col rounded-custom;

  &::after {
    // --apply: absolute content-empty inset-0 pointer-events-none;
    // --apply: outline-2 outline-dashed outline-red outline-offset-2 rounded-custom;
  }

  .wrapper-body {
    --apply: dark:bg-darker bg-white;
    --apply: relative grid;
    margin: var(--bodyMargin);

    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto 1fr;
    grid-template-areas:
      "nothing label nothing2 nothing3"
      "prepend input loading  append";

    .prepend {
      grid-area: prepend;
    }

    .append {
      --apply: fit;
      grid-area: append;
    }

    .wrapper-body__input {
      grid-area: input;
    }

    .wrapper-body__input-modified {
      --apply: flex gap-1 items-center absolute top-1 right-1 text-xs z-1;
    }

    .label {
      grid-area: label;
    }

    .loading {
      grid-area: loading;
    }

    &.has-border::after {
      --apply: content-empty absolute inset-inline-0 bottom-0 top-0 transition-all
      border-custom rounded-custom pointer-events-none;
    }

    &::after {
      --apply: border-ca;
    }

    &:focus-within::after {
      --apply: border-$borderColor;
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

      .label {
        --apply: lt-md:(p-t-2 self-end);
      }
    }
  }

  &-body {
    --apply: flex items-center rounded-custom;

    &__input {
      --apply: flex lt-md:flex-col relative grow gap-x-2 gap-y-1px overflow-auto h-full;
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


  &.is-inline {
      .wrapper-body::after {
        --apply: lt-md:top-22px;
      }
    }

  &--md {
    &.is-inline {
      .wrapper-body::after {
        --apply: lt-md:top-6;
      }
    }
  }

  &--lg {
    &.is-inline {
      .wrapper-body::after {
        --apply: lt-md:top-7;
      }
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
