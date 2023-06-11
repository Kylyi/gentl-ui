<script setup lang="ts">
// Parent component should handle `dismiss` event and remove Banner from the DOM

// TYPES
import { IBannerProps } from '~/components/Banner/types/banner-props.type'

const props = withDefaults(defineProps<IBannerProps>(), {
  modelValue: true,
})

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'dismiss'): void
}>()

// LAYOUT
const model = useVModel(props, 'modelValue')
const internalValue = ref(props.modelValue)
const counter = toRef(props, 'counter')
const bannerEl = ref<HTMLDivElement>()

const icon = computed(() => {
  const iconClass = props.iconCenter ? 'self-center' : 'self-start'

  switch (props.type) {
    case 'warning':
      return `${iconClass} clarity:warning-solid`
    case 'info':
      return `${iconClass} bi:info-lg`
    case 'success':
      return `${iconClass} akar-icons:circle-check-fill`
    case 'error':
      return `${iconClass} ci:error`
    default:
      return `${iconClass} bi:info-lg`
  }
})

function dismiss() {
  if (props.dismissable) {
    internalValue.value = false
    model.value = false
  }
}

// COUNTER
const counterEl = ref<HTMLSpanElement>()
const { apply } = useMotion(counterEl, {
  initial: { scale: 1 },
  enter: { scale: 1 },
  bounce: {
    scale: 1.25,
    transition: {
      type: 'keyframes',
      duration: 100,
    },
  },
})

watch(counter, async () => {
  await apply('bounce')
  await apply('enter')
})

defineExpose({
  dismiss,
})
</script>

<template>
  <Transition
    appear
    :css="!noTransition"
    @after-leave="$emit('dismiss')"
  >
    <div
      v-if="model && internalValue"
      ref="bannerEl"
      class="banner"
      :class="[
        `banner--${type}`,
        { 'is-outlined': outlined },
        { 'is-dismissable': dismissable },
      ]"
      @click="dismiss"
    >
      <!-- ICON -->
      <div
        class="banner-icon"
        :class="[icon, iconClass]"
      />

      <!-- TEXT -->
      <div class="banner-text">
        <slot>
          {{ label }}
        </slot>
      </div>

      <!-- COUNTER -->
      <span
        v-if="counter && counter > 1"
        ref="counterEl"
        class="banner-counter"
      >
        {{ counter }}
      </span>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.banner {
  --apply: flex flex-gap-x-2 items-center rounded-custom p-x-2 p-y-1 relative
    min-h-12 color-true-gray;

  &-icon {
    --apply: h-6 w-6 flex-shrink-0 m-y-1;
  }

  &-text {
    --apply: flex-grow;
  }

  &.is-dismissable {
    --apply: cursor-pointer;
  }

  &-counter {
    --apply: absolute flex flex-center top--2 right--2 bg-inherit color-inherit
     rounded-2 border-current border-2 text-sm p-x-1 h-5.5 min-w-6 z-1;
  }

  &--warning {
    --apply: bg-warning color-white;
  }

  &--error {
    --apply: bg-negative color-white;
  }

  &--success {
    --apply: bg-positive color-white;
  }

  &--info {
    --apply: bg-info color-white;
  }
}

.is-outlined.banner {
  --apply: bg-inherit border-true-gray color-true-gray border-2;

  .banner-counter {
    --apply: dark:bg-darker bg-white;
  }

  &--warning {
    --apply: color-warning border-warning bg-warning/15;
  }

  &--error {
    --apply: color-negative border-negative bg-negative/15;
  }

  &--success {
    --apply: color-positive border-positive bg-positive/15;
  }

  &--info {
    --apply: color-info border-info bg-info/15;
  }
}

// TRANSITION
.v-enter-active,
.v-leave-active {
  transition: all 0.25s ease;
}

.v-enter-from {
  --apply: opacity-0 scale-0;
}

.v-leave-to {
  --apply: opacity-0 translate-x--100%;
}
</style>
