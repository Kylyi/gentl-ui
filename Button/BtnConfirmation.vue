<script setup lang="ts">
type IProps = {
  label?: string
  modelValue?: boolean
  mode?: 'labeled' | 'inside'
  position?: 'left' | 'right' | 'top' | 'bottom'
  type?: 'positive' | 'negative'
}

withDefaults(defineProps<IProps>(), {
  mode: 'labeled',
  position: 'left',
  type: 'positive',
})

const model = defineModel<boolean>()
const hidden = ref(false)
let timeout: any

defineExpose({
  showTemporarily: (onCleanup?: () => void) => {
    clearTimeout(timeout)
    timeout = null
    model.value = true
    hidden.value = false

    timeout = setTimeout(() => {
      hidden.value = true

      setTimeout(() => {
        model.value = false
        onCleanup?.()
      }, 250)
    }, 2000)
  },
})
</script>

<template>
  <div
    v-if="model && !hidden && mode === 'inside'"
    class="confirmation__inside"
  >
    <Checkmark
      v-if="type === 'positive'"
      w="full"
      h="full"
    />

    <Close
      v-else
      w="full"
      h="full"
    />
  </div>

  <Transition
    v-else-if="mode === 'labeled'"
    appear
  >
    <span
      v-if="model && !hidden"
      class="confirmation__labeled"
      color="positive"
      bg="white dark:bg-darker"
      :class="`confirmation__labeled--${position}`"
    >
      {{ label }}
    </span>
  </Transition>
</template>

<style lang="scss" scoped>
.confirmation__inside {
  @apply absolute bg-white dark:bg-darker inset-0 p-2;
}

.confirmation__labeled {
  @apply bg-white dark:bg-darker absolute pointer-events-none
    rounded-custom p-x-2 text-sm tracking-wide z-$zMax h-full
    flex flex-center font-normal font-rem-14;

  text-transform: none;

  &--left {
    @apply -left-12px translate-x--100% top-0;
  }

  &--right {
    @apply -right-12px translate-x-100% top-0;
  }

  &--top {
    @apply -top-12px translate-y--100%;
  }

  &--bottom {
    @apply -bottom-12px translate-y-100%;
  }

  &--center {
    @apply top-1/2 left-1/2 translate-x--50% translate-y--50%;
  }
}

.v-enter-active,
.v-leave-active {
  transition: all 0.25s ease;
}

.v-enter-from,
.v-leave-to {
  @apply opacity-0;

  &.tooltip--left {
    @apply left-12px;
  }

  &.tooltip--right {
    @apply right-12px;
  }

  &.tooltip--top {
    @apply top-12px;
  }

  &.tooltip--bottom {
    @apply bottom-12px;
  }

  &.tooltip--center {
    @apply scale-50;
  }
}
</style>
