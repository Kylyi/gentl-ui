<script setup lang="ts">
import type {
  IToggleProps,
  ToggleClass,
  ToggleState,
} from '~~/components/Toggle/types/toggle-props.type'

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
  (e: 'update:modelValue', val?: boolean | null): void
}>()

// STATE
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

// LAYOUT
const itemProps = reactivePick(props, ['noHoverEffect', 'tag'])

const defaultClasses = computed<ToggleClass>(() => {
  return {
    unchecked: {
      toggle: props.filled ? 'bg-negative/15 border-negative' : '',
      bullet:
        props.indeterminateValue !== undefined ? 'bg-negative' : 'bg-neutral',
      icon: '',
    },
    indeterminate: {
      toggle: props.filled ? 'bg-neutral/15 border-neutral' : '',
      bullet: 'bg-neutral',
      icon: '',
    },
    checked: {
      toggle: props.filled ? 'bg-positive/15 border-positive' : '',
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
    @click="handleStateChange"
  >
    <slot name="prepend" />

    <div
      class="toggle"
      border="1 ca hover:true-gray-400"
      :class="toggleClasses"
      v-bind="$attrs"
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
      <div p="r-3">
        {{ label }}
      </div>
    </slot>

    <slot name="append" />
  </Item>
</template>

<style lang="scss" scoped>
.toggle {
  -webkit-tap-highlight-color: transparent;
  --apply: flex items-center cursor-pointer select-none relative;

  &.is-readonly {
    --apply: border-dotted cursor-default;
  }

  &.is-disabled {
    --apply: cursor-not-allowed disabled;
  }

  &--xs {
    --apply: w-10 h-6 m-y-1 m-x-2;

    .bullet {
      --apply: h-7 w-7;

      &.is-contained {
        --apply: h-4.5 w-4.5;
      }
    }
  }

  &--sm {
    --apply: w-12 h-7 m-y-1.5 m-x-2.5;

    .bullet {
      --apply: h-8 w-8;

      &.is-contained {
        --apply: h-5.5 w-5.5;
      }
    }
  }

  &--md {
    --apply: w-13 h-8 m-y-2 m-x-2.5;

    .bullet {
      --apply: h-9 w-9;

      &.is-contained {
        --apply: h-6.5 w-6.5;
      }
    }
  }

  &--lg {
    --apply: w-15 h-9 m-y-2.5 m-x-3;

    .bullet {
      --apply: h-10 w-10;

      &.is-contained {
        --apply: h-7.5 w-7.5;
      }
    }
  }

  &.is-hoverable:hover {
    .bullet {
      --apply: shadow-consistent-sm-fill shadow-ca;
    }
  }

  .bullet {
    --apply: relative ease-linear flex flex-center;
    transition: transform 0.25s, box-shadow 0.15s;
  }

  &.is-unchecked {
    .bullet {
      --apply: translate-x--8px;
    }

    .bullet.is-contained {
      --apply: translate-x-2px;
    }
  }

  &.is-checked {
    &.toggle--xs {
      .bullet {
        --apply: translate-x-18px;
      }
    }

    &.toggle--sm,
    &.toggle--md {
      .bullet {
        --apply: translate-x-22px;
      }
    }

    &.toggle--lg {
      .bullet {
        --apply: translate-x-26px;
      }
    }
  }

  &.is-indeterminate {
    &.toggle--xs {
      .bullet {
        --apply: translate-x-5px;
      }

      .bullet.is-contained {
        --apply: translate-x-10px;
      }
    }

    &.toggle--sm,
    &.toggle--md {
      .bullet {
        --apply: translate-x-7px;
      }

      .bullet.is-contained {
        --apply: translate-x-12px;
      }
    }

    &.toggle--lg {
      .bullet {
        --apply: translate-x-9px;
      }

      .bullet.is-contained {
        --apply: translate-x-14px;
      }
    }
  }
}
</style>
