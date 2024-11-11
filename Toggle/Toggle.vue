<script setup lang="ts">
import type {
  IToggleProps,
  ToggleClass,
  ToggleState,
} from '~/components/Toggle/types/toggle-props.type'

const props = withDefaults(defineProps<IToggleProps>(), {
  allowString: true,
  modelValue: null,
  checkValue: true,
  uncheckValue: false,
  contained: true,
  rounding: 'full',
  size: 'md',
})

const emits = defineEmits<{
  (e: 'update:modelValue', val?: any): void
}>()

// State
const model = useVModel(props, 'modelValue', emits)

const internalValue = computed<ToggleState>(() => {
  if (props.allowString) {
    const val = model.value === null ? 'null' : model.value.toString()

    return val === props.checkValue?.toString()
      ? 'checked'
      : val === props.uncheckValue?.toString()
        ? 'unchecked'
        : 'indeterminate'
  }

  return model.value === props.checkValue
    ? 'checked'
    : model.value === props.uncheckValue
      ? 'unchecked'
      : 'indeterminate'
})

function handleStateChange() {
  if (props.readonly || props.disabled) {
    return
  }

  const states = [
    props.uncheckValue,
    props.indeterminateValue,
    props.checkValue,
    ...(props.allowString
      ? [
          props.uncheckValue?.toString(),
          props.indeterminateValue?.toString(),
          props.checkValue?.toString(),
        ]
      : []),
  ].filter(state => state !== undefined)

  const currentStateIdx = states.indexOf(model.value)

  if (currentStateIdx > -1) {
    let val = states[(currentStateIdx + 1) % states.length]

    if (val === 'true') {
      val = true
    } else if (val === 'false') {
      val = false
    } else if (val === 'null') {
      val = null
    }

    model.value = val
  } else {
    model.value = props.checkValue
  }
}

// Layout
const toggleEl = ref<HTMLDivElement>()
const itemProps = reactivePick(props, ['noHoverEffect', 'tag'])

function handleFocus() {
  toggleEl.value?.focus()
}

const defaultClasses = computed<ToggleClass>(() => {
  return {
    unchecked: {
      toggle: props.filled
        ? 'bg-negative/15 border-negative'
        : 'bg-white dark:bg-darker',
      bullet:
        props.indeterminateValue !== undefined
          ? 'bg-negative color-negative'
          : 'bg-neutral',
      icon: '',
    },
    indeterminate: {
      toggle: props.filled
        ? 'bg-neutral/15 border-neutral'
        : 'bg-white dark:bg-darker',
      bullet: 'bg-neutral',
      icon: '',
    },
    checked: {
      toggle: props.filled
        ? 'bg-positive/15 border-positive'
        : 'bg-white dark:bg-darker',
      bullet: 'bg-positive',
      icon: '',
    },
  }
})

const classes = computed<ToggleClass>(() => {
  return merge(defaultClasses.value, props.visuals)
})

const toggleClasses = computed(() => {
  return [
    `toggle--${props.size}`,
    `is-${internalValue.value}`,
    props.rounding === 'full'
      ? 'rounded-full'
      : props.rounding === 'normal'
        ? 'rounded-custom'
        : '',
    {
      'is-hoverable': props.hoverable,
      'is-readonly': props.readonly,
      'is-disabled': props.disabled,
      'is-contained': props.contained,
    },
    classes.value[internalValue.value].toggle,
  ]
})

const bulletClasses = computed(() => {
  return [
    props.rounding === 'full'
      ? 'rounded-full'
      : props.rounding === 'normal'
        ? 'rounded-custom'
        : '',
    { 'is-contained': props.contained },
    classes.value[internalValue.value].bullet,
  ]
})

const icon = computed(() => {
  return classes.value[internalValue.value]?.icon
})

// Keyboard navigation
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault?.()

    handleStateChange()
  }
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <Item
    v-bind="itemProps"
    :class="containerClass"
    :readonly="readonly"
    :disabled="disabled"
    class="wrapper"
    .focus="handleFocus"
    @click="handleStateChange"
  >
    <slot name="prepend" />

    <div
      ref="toggleEl"
      class="toggle"
      border="1 ca hover:true-gray-400"
      shrink-0
      :class="toggleClasses"
      v-bind="$attrs"
      tabindex="0"
      @keydown="handleKeyDown"
    >
      <div
        class="bullet"
        :class="bulletClasses"
      >
        <slot name="bullet">
          <div
            v-if="icon"
            :class="icon"
          />
        </slot>
      </div>
    </div>

    <slot v-if="label">
      <div
        class="toggle-label"
        p="r-3"
        :class="[labelClass, `toggle-label--${size}`]"
      >
        {{ label }}
      </div>
    </slot>

    <slot name="append" />
  </Item>
</template>

<style lang="scss" scoped>
.toggle {
  -webkit-tap-highlight-color: transparent;
  @apply flex items-center cursor-pointer select-none relative;

  &.is-readonly {
    @apply border-dotted cursor-default;

    &.is-checked .bullet {
      @apply bg-positive/50 border-2 border-dotted border-positive;
    }

    &.is-unchecked .bullet {
      @apply bg-neutral/50 border-2 border-dotted border-neutral;
    }
  }

  &-label--xs,
  &-label--sm {
    @apply text-sm;
  }

  &.is-disabled {
    @apply cursor-not-allowed disabled;
  }

  &--xs {
    @apply w-8 h-4.5 m-y-0.75 m-l-3 m-r-1.5;

    &.is-contained {
      @apply m-x-1.5;
    }

    .bullet {
      @apply h-5 w-5;

      &.is-contained {
        @apply h-3.5 w-3.5;
      }
    }
  }

  &--sm {
    @apply w-9 h-5.5 m-y-0.5 m-l-2.5 m-r-1.5;

    &.is-contained {
      @apply m-x-1.5;
    }

    .bullet {
      @apply h-6 w-6;

      &.is-contained {
        @apply h-4.5 w-4.5;
      }
    }
  }

  &--md {
    @apply w-11 h-6 m-y-1 m-l-3.5 m-r-2;

    &.is-contained {
      @apply m-l-2.5 m-r-2;
    }

    .bullet {
      @apply h-7 w-7;

      &.is-contained {
        @apply h-5 w-5;
      }
    }
  }

  &--lg {
    @apply w-12 h-7 m-y-1.5 m-l-3.5 m-r-2;

    &.is-contained {
      @apply m-l-2.5 m-r-2;
    }

    .bullet {
      @apply h-8 w-8;

      &.is-contained {
        @apply h-5.5 w-5.5;
      }
    }
  }

  &.is-hoverable:hover {
    .bullet {
      @apply shadow-consistent-sm-fill shadow-ca;
    }
  }

  .bullet {
    @apply relative ease-linear flex flex-center;
    transition:
      transform 0.25s,
      box-shadow 0.15s;
  }

  &.is-unchecked {
    .bullet {
      @apply translate-x--8px;
    }

    .bullet.is-contained {
      @apply translate-x-2px;
    }
  }

  &.is-checked {
    &.toggle--xs {
      .bullet {
        @apply translate-x-14px;
      }
    }

    &.toggle--sm {
      .bullet {
        @apply translate-x-14px;
      }
    }

    &.toggle--md {
      .bullet {
        @apply translate-x-20px;
      }
    }

    &.toggle--lg {
      .bullet {
        @apply translate-x-22px;
      }
    }
  }

  &.is-indeterminate {
    &.toggle--xs {
      .bullet {
        @apply translate-x-5px;
      }

      .bullet.is-contained {
        @apply translate-x-8px;
      }
    }

    &.toggle--sm {
      .bullet {
        @apply translate-x-5px;
      }

      .bullet.is-contained {
        @apply translate-x-8px;
      }
    }

    &.toggle--md {
      .bullet {
        @apply translate-x-7px;
      }

      .bullet.is-contained {
        @apply translate-x-11px;
      }
    }

    &.toggle--lg {
      .bullet {
        @apply translate-x-7px;
      }

      .bullet.is-contained {
        @apply translate-x-12px;
      }
    }
  }
}
</style>
