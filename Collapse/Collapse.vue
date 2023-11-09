<script setup lang="ts">
// Types
import type { ICollapseProps } from '~/components/Collapse/types/collapse-props.type'

const props = withDefaults(defineProps<ICollapseProps>(), {
  padded: true,
})

const emits = defineEmits<{
  (e: 'update:model-value', val: boolean): void
  (e: 'before-show'): void
  (e: 'show'): void
  (e: 'before-hide'): void
  (e: 'hide'): void
}>()

// Layout
const headerEl = ref<HTMLDivElement>()
const contentEl = ref<HTMLDivElement>()
const model = toRef(props, 'modelValue')
const preventNextExpand = autoResetRef(false, 100)
const internalValue = ref<boolean>(model.value || !!props.initialValue)

function handleToggle() {
  if (preventNextExpand.value) {
    return
  }

  preventNextExpand.value = true

  internalValue.value = !internalValue.value
  internalValue.value ? emits('before-show') : emits('before-hide')
  emits('update:model-value', internalValue.value)
}

function handleEnter() {
  emits('show')
  resetStyle()
}

function handleLeave() {
  emits('hide')
  resetStyle()
}

function resetStyle() {
  if (contentEl.value) {
    contentEl.value.style.height = ''
  }
}

// We react to model value changes from parent
watch(model, val => {
  internalValue.value = !!val
})

// We need to trigger the height animation on internlValue change
watch(internalValue, val => {
  if (!contentEl.value) {
    return
  }

  if (val) {
    contentEl.value.style.height = '0px'

    nextTick(() => {
      contentEl.value!.style.height = `${contentEl.value!.scrollHeight}px`
    })
  } else {
    contentEl.value.style.height = `${contentEl.value.scrollHeight}px`

    nextTick(() => {
      contentEl.value!.style.height = '0px'
    })
  }
})

// Moves the content element below the header on window resizing
useResizeObserver(headerEl, entries => {
  const { height } = entries[0].contentRect

  if (contentEl.value && props.floating) {
    contentEl.value.style.top = `${height}px`
  }
})
</script>

<template>
  <div
    class="collapse"
    :class="{
      'is-padded': internalValue && padded,
    }"
  >
    <!-- Header -->
    <div
      v-if="!noHeader"
      ref="headerEl"
      class="header"
      :class="[
        { 'is-expanded': internalValue },
        { 'has-subtitle': subtitle },
        { 'no-separator': !!noSeparator },
        headerClass,
      ]"
      :style="headerStyle"
      @click="handleToggle"
    >
      <slot
        name="header"
        :toggle="handleToggle"
      >
        <div flex="~ col grow">
          <slot name="title">
            <h6
              flex="1"
              text="h6"
              truncate
              leading="!tight"
            >
              <span
                tracking="wide"
                color="$Collapse-header-title-color"
              >
                {{ title }}
              </span>
            </h6>
          </slot>

          <slot name="subtitle">
            <span
              v-if="subtitle"
              font="rem-12"
              italic
              color="ca"
              leading="tight"
              p="t-2px"
            >
              {{ subtitle }}
            </span>
          </slot>
        </div>
      </slot>

      <slot
        name="right"
        :open="internalValue"
      />

      <slot name="expand-icon">
        <div
          majesticons:chevron-right
          transition="duration-150"
          color="$Collapse-dropdown-icon-color"
          :class="{ 'rotate-90deg': internalValue }"
        />
      </slot>
    </div>

    <!-- Content -->
    <Transition
      :enter-active-class="`${transitionClass} transition-all duration-0.25s ease-linear overflow-hidden will-change-height`"
      :leave-active-class="`${transitionClass} transition-all duration-0.25s ease-linear overflow-hidden will-change-height`"
      @after-enter="handleEnter"
      @after-leave="handleLeave"
    >
      <div
        v-show="internalValue"
        ref="contentEl"
        class="content"
        w="full"
        :class="[contentClass, { 'absolute left-0 z-$zMenu': floating }]"
      >
        <slot />
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.collapse {
  --apply: relative flex flex-col rounded-b-custom;

  &.is-padded {
    --apply: p-t-2 p-b-4 p-x-2;
  }

  // &::before {
  //   --apply: content-empty inset-block-0 absolute bg-primary w-1 transition-width rounded-l-full;
  // }
}

.header {
  --apply: flex min-h-12 flex-gap-x-2 items-center p-x-4 items-center
    rounded-custom cursor-pointer transition-border-radius duration-100;
  --apply: bg-$Collapse-header-bg;

  &.is-expanded {
    --apply: rounded-b-0;
  }

  &.is-expanded:not(.no-separator) {
    --apply: border-b-1 border-ca;
  }

  &.has-subtitle {
    --apply: min-h-16;
  }
}

.content {
  --apply: origin-top rounded-b-custom;
}

:slotted(.content > *:last-child) {
  --apply: rounded-b-custom;
}

// Transition
.v-enter-from,
.v-leave-to {
  --apply: opacity-0;
}
</style>
