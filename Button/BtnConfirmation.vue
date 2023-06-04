<script setup lang="ts">
type IProps = {
  modelValue?: boolean
  label: string
  position?: 'left' | 'right' | 'top' | 'bottom'
}

withDefaults(defineProps<IProps>(), {
  position: 'left',
})

const internalValue = ref(false)
const hidden = ref(false)
let timeout: any

defineExpose({
  showTemporarily: (cleanup?: () => void) => {
    clearTimeout(timeout)
    timeout = null
    internalValue.value = true
    hidden.value = false

    timeout = setTimeout(() => {
      hidden.value = true

      setTimeout(() => {
        internalValue.value = false
        cleanup?.()
      }, 250)
    }, 2000)
  },
})
</script>

<template>
  <Transition appear>
    <span
      v-if="(modelValue || internalValue) && !hidden"
      class="tooltip"
      color="positive"
      :class="`tooltip--${position}`"
    >
      {{ label }}
    </span>
  </Transition>
</template>

<style lang="scss" scoped>
.tooltip {
  --apply: bg-white dark:bg-darker absolute pointer-events-none
    rounded-custom p-x-2 text-sm tracking-wide z-10 h-full
    flex flex-center;

  &--left {
    --apply: -left-12px translate-x--100% top-0;
  }

  &--right {
    --apply: -right-12px translate-x-100% top-0;
  }

  &--top {
    --apply: -top-12px translate-y--100%;
  }

  &--bottom {
    --apply: -bottom-12px translate-y-100%;
  }

  &--center {
    --apply: top-1/2 left-1/2 translate-x--50% translate-y--50%;
  }
}

.v-enter-active,
.v-leave-active {
  transition: all 0.25s ease;
}

.v-enter-from,
.v-leave-to {
  --apply: opacity-0;

  &.tooltip--left {
    --apply: left-12px;
  }

  &.tooltip--right {
    --apply: right-12px;
  }

  &.tooltip--top {
    --apply: top-12px;
  }

  &.tooltip--bottom {
    --apply: bottom-12px;
  }

  &.tooltip--center {
    --apply: scale-50;
  }
}
</style>
