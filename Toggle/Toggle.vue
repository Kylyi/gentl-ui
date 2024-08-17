<script setup lang="ts">
import type {
  IToggleProps,
  ToggleClass,
  ToggleState,
} from '~/components/Toggle/types/toggle-props.type'

const props = withDefaults(defineProps<IToggleProps>(), {
  allowString: true,
  size: 'xs',
  modelValue: null,
  checkValue: true,
  uncheckValue: false,
  contained: true,
  rounding: 'full',
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
    @apply min-w-10 min-h-6 m-y-1 m-x-2;

    .bullet {
      @apply min-h-7 min-w-7;

      &.is-contained {
        @apply min-h-4.5 min-w-4.5;
      }
    }
  }

  &--sm {
    @apply min-w-12 min-h-7 m-y-1.5 m-x-2.5;

    .bullet {
      @apply min-h-8 min-w-8;

      &.is-contained {
        @apply min-h-5.5 min-w-5.5;
      }
    }
  }

  &--md {
    @apply min-w-13 min-h-8 m-y-2 m-x-2.5;

    .bullet {
      @apply min-h-9 min-w-9;

      &.is-contained {
        @apply min-h-6.5 min-w-6.5;
      }
    }
  }

  &--lg {
    @apply min-w-15 min-h-9 m-y-2.5 m-x-3;

    .bullet {
      @apply min-h-10 min-w-10;

      &.is-contained {
        @apply min-h-7.5 min-w-7.5;
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
        @apply translate-x-18px;
      }
    }

    &.toggle--sm,
    &.toggle--md {
      .bullet {
        @apply translate-x-22px;
      }
    }

    &.toggle--lg {
      .bullet {
        @apply translate-x-26px;
      }
    }
  }

  &.is-indeterminate {
    &.toggle--xs {
      .bullet {
        @apply translate-x-5px;
      }

      .bullet.is-contained {
        @apply translate-x-10px;
      }
    }

    &.toggle--sm,
    &.toggle--md {
      .bullet {
        @apply translate-x-7px;
      }

      .bullet.is-contained {
        @apply translate-x-12px;
      }
    }

    &.toggle--lg {
      .bullet {
        @apply translate-x-9px;
      }

      .bullet.is-contained {
        @apply translate-x-14px;
      }
    }
  }
}
</style>
