<script setup lang="ts">
// TYPES
import type { ICollapseProps } from '~~/components/Collapse/types/collapse-props.type'

const props = withDefaults(defineProps<ICollapseProps>(), {
  padded: true,
})

const emits = defineEmits<{
  (e: 'update:model-value', val: boolean): void
  (e: 'before-show'): void
  (e: 'before-hide'): void
}>()

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
    :class="{ 'is-padded': internalValue && padded }"
  >
    <!-- HEADER -->
    <div
      v-if="!noHeader"
      ref="headerEl"
      class="header"
      :class="[
        { 'is-expanded': internalValue },
        { 'has-subtitle': subtitle },
        headerClass,
      ]"
      @click="handleToggle"
    >
      <slot
        name="header"
        :toggle="handleToggle"
      >
        <div flex="~ col grow">
          <h6
            flex="1"
            text="h6"
            truncate
            leading="!tight"
          >
            <span
              tracking="wide"
              color="ca"
            >
              {{ title }}
            </span>
          </h6>

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
          :class="{ 'rotate-90deg': internalValue }"
        />
      </slot>
    </div>

    <!-- CONTENT -->
    <Transition
      @after-enter="resetStyle"
      @after-leave="resetStyle"
    >
      <div
        v-show="internalValue"
        ref="contentEl"
        class="content"
        w="full"
        :class="{ 'absolute left-0 z-$zMenu': floating }"
      >
        <slot />
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.collapse {
  --apply: relative flex flex-col transition-padding;

  &.is-padded {
    --apply: p-t-2 p-b-4 p-x-2;
  }
}


.header {
  --apply: flex min-h-12 flex-gap-x-2 items-center p-x-4 items-center rounded-custom
    cursor-pointer hover:bg-ca transition-border-radius duration-100;

  &.is-expanded {
    --apply: bg-ca rounded-b-0 border-b-1 border-ca;
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

// TRANSITION
.v-enter-active,
.v-leave-active {
  transition: all 0.25s linear;
  overflow: hidden;
  will-change: height;
}

.v-enter-from,
.v-leave-to {
  --apply: opacity-0;
}
</style>
