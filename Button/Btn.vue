<script setup lang="ts">
// Types
import type { IBtnProps } from '~/components/Button/types/btn-props.type'

// Components
import BtnOrNuxtLinkResolver from '~/components/Button/BtnOrNuxtLinkResolver.vue'

// Constants
import { BUTTON_PRESET } from '~/components/Button/constants/button-preset.constant'

// Directives
import { vRipple } from '~/libs/App/directives/ripple.directive'

const props = withDefaults(defineProps<IBtnProps>(), {
  align: 'center',
  rounded: true,
  disableStyle: 'filled',
  ripple: true,
  size: 'md',
  type: 'button',
})

const btnProps = reactivePick(props, [
  'external',
  'noActiveLink',
  'to',
  'type',
  'disabled',
  'download',
  'exact',
  'navigateToOptions',
])

// Layout
const slots = useSlots()
const component = ref<InstanceType<typeof BtnOrNuxtLinkResolver>>()
const preset = computed(() =>
  props.preset ? BUTTON_PRESET[props.preset] : null
)

const btnClass = computedEager(() => {
  return [
    `btn--${props.size}`,
    { 'is-stacked': props.stacked },
    { 'is-dimmed': !props.noDim },
    { 'is-round': props.round },
    { 'is-rounded': props.rounded && !props.round },
    { 'is-outlined': props.outlined },
    { 'is-bold': !props.noBold },
    { [`is-disabled is-disabled--${props.disableStyle}`]: props.disabled },
    { 'has-label': props.label || slots.label },
    { 'has-icon': props.icon || preset.value?.icon || slots.icon },
    { 'is-center': props.align === 'center' },
    { 'is-left': props.align === 'left' },
    { 'is-right': props.align === 'right' },
    { 'is-uppercase': !props.noUppercase },
    ...(preset.value?.color ? [preset.value.color] : []),
  ]
})

defineExpose({
  getElement: () => component.value,
})
</script>

<template>
  <BtnOrNuxtLinkResolver
    ref="component"
    v-ripple="!disabled && ripple"
    :name="name ?? (label || icon)"
    :aria-label="label ?? (name || icon)"
    v-bind="btnProps"
    class="btn"
    :class="btnClass"
  >
    <slot name="icon">
      <div
        v-if="icon || preset"
        class="icon"
        :class="[icon || preset?.icon]"
      />
    </slot>

    <slot name="label">
      <div
        v-if="label"
        class="btn-label"
        :class="[labelClass, noTruncate ? 'overflow-hidden' : 'truncate']"
      >
        {{ label }}
      </div>
    </slot>

    <slot />

    <div
      v-if="loading"
      class="loading"
      @click.stop.prevent
    >
      <Loader
        :type="loaderType || 'block'"
        :color="loadingColor"
        class="loading__loader"
      />
    </div>

    <!-- Hover focus helper -->
    <span
      v-if="!noHoverEffect"
      class="focus-helper"
      tabindex="-1"
    />
  </BtnOrNuxtLinkResolver>
</template>

<style lang="scss" scoped>
.btn {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;

  --apply: flex items-center tracking-wide relative
    cursor-pointer select-none;

  &.is-uppercase {
    --apply: uppercase;
  }

  &-label {
    --apply: leading-tight tracking-wider max-w-full;
  }

  &.is-left {
    --apply: justify-start;

    .btn-label {
      --apply: text-left;
    }
  }

  &.is-center {
    --apply: justify-center;

    .btn-label {
      --apply: text-center;
    }
  }

  &.is-right {
    --apply: justify-end;

    .btn-label {
      --apply: text-right;
    }
  }

  &.is-stacked {
    --apply: flex-col flex-center p-y-1;
  }

  .icon {
    --apply: flex shrink-0;
  }

  &.is-bold {
    --apply: font-semibold;
  }

  &.is-uppercase {
    --apply: uppercase;
  }

  &.is-dimmed {
    --apply: opacity-80 hover:opacity-100;
  }

  &.is-round {
    --apply: rounded-full;
  }

  &.is-rounded {
    --apply: rounded-custom;
  }

  &.is-disabled {
    --apply: disabled cursor-not-allowed;

    * {
      --apply: cursor-not-allowed;
    }

    &--filled {
      --apply: border-none;
    }

    &--flat {
      --apply: "!bg-transparent";
    }
  }

  &.is-outlined {
    --apply: dark:bg-darker bg-white border-solid border-2 border-current;
  }

  &--xs {
    --apply: min-h-6 min-w-6 flex-gap-x-0.5 flex-gap-x-1 p-x-2;

    .icon {
      --apply: h-3.5 w-3.5;
    }

    &.is-rounded {
      --apply: rounded-1.5;
    }

    .btn-label {
      --apply: font-rem-10 p-y-1;
    }

    .loading__loader {
      --apply: h-3.5;
    }
  }

  &--sm {
    --apply: min-h-8 min-w-8 flex-gap-x-1.5 flex-gap-y-1 p-x-2.5;

    .icon {
      --apply: h-4.5 w-4.5;
    }

    .btn-label {
      --apply: font-rem-12 p-y-1.5;
    }

    .loading__loader {
      --apply: h-4.5;
    }
  }

  &--md {
    --apply: min-h-10 min-w-10 flex-gap-x-2 flex-gap-y-1 p-x-3;

    .icon {
      --apply: h-5.5 w-5.5;
    }

    .btn-label {
      --apply: font-rem-14 p-y-2;
    }

    .loading__loader {
      --apply: h-5.5;
    }
  }

  &--lg {
    --apply: min-h-12 min-w-12 flex-gap-x-2.5 flex-gap-y-1.5 p-x-3.5;

    .icon {
      --apply: h-6.5 w-6.5;
    }

    .btn-label {
      --apply: font-rem-16 p-y-2.5;
    }

    .loading__loader {
      --apply: h-6.5;
    }
  }

  &:not(.has-label) {
    --apply: p-x-0;
  }
}

.focus-helper {
  --apply: absolute fit z-3
    cursor-pointer rounded-inherit inset-0 pointer-events-none;
}

.btn:hover .focus-helper {
  --apply: bg-current opacity-10;
}

.loading {
  --apply: absolute flex flex-center fit top-0 left-0 z-4 bg-white dark:bg-dark
    opacity-95 rounded-inherit cursor-wait;
}
</style>
