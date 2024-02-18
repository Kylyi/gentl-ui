<script setup lang="ts">
// Types
import type { IDialogProps } from '~/components/Dialog/types/dialog-props.type'

// Functions
import { useDialogLayout } from '~/components/Dialog/functions/useDialogLayout'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<IDialogProps>(), {
  maxHeight: 99999,
  position: 'center',
  transitionDuration: 300,
})

const emits = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'hide'): void
  (e: 'show'): void
  (e: 'beforeHide'): void
  (e: 'beforeShow'): void
}>()

defineExpose({
  show: () => (modelHandler.value = true),
  hide: (force?: boolean) => {
    isChangeForced.value = !!force
    modelHandler.value = false
  },
  toggle: () => (modelHandler.value = !modelHandler.value),
  getFloatingEl: () => floatingEl.value,
})

// Layout
const model = defineModel({ default: false })
const isChangeForced = ref(false)
const debouncedModel = ref(model.value)

const modelHandler = computed({
  get: () => model.value,
  set: async val => {
    let shouldContinue = true

    if (!val && !isChangeForced.value) {
      shouldContinue = (await props.beforeHideFnc?.()) ?? true
    }

    if (shouldContinue) {
      model.value = val
    } else {
      bounce()
    }

    isChangeForced.value = false
  },
})

const dialogMaxHeight = computed(() => {
  return typeof props.maxHeight === 'number'
    ? `${props.maxHeight}px`
    : props.maxHeight
})

const transitionClass = computed(() => {
  switch (props.position) {
    case 'top':
      return 'opacity-0 transform-origin-top translate-y--1/2'
    case 'bottom':
      return 'opacity-0 transform-origin-bottom translate-y-1/2'
    case 'left':
      return 'opacity-0 transform-origin-left translate-x--1/2'
    case 'right':
      return 'opacity-0 transform-origin-right translate-x-1/2'
    default:
      return 'opacity-0 transform-origin-center scale-20'
  }
})

const { contentEl, dialogWrapperEl, floatingEl } = useDialogLayout(
  modelHandler,
  props
)

function hide() {
  modelHandler.value = false
}

function commitHide() {
  if (model.value) {
    return
  }

  debouncedModel.value = false
  emits('hide')
}

// We sync the model with the debouncedModel immediately when the value is `true`
// to show the content immediately to trigger the transition
whenever(model, isVisible => {
  debouncedModel.value = isVisible
})

// Click outside
onClickOutside(floatingEl, handleClickOutside, {
  ignore: props.ignoreClickOutside,
})

function handleClickOutside(ev: Event) {
  if (!model.value) {
    return
  }

  const targetEl = ev.target as HTMLElement

  const isTargetBody = targetEl === document.body
  const isPartOfFloatingUI = floatingEl.value?.contains(targetEl)
  const lastFloatingElement = document.querySelector(
    '.floating-element:last-child'
  )
  const isNotifications = !!targetEl.closest('.notifications')

  if (
    !isTargetBody &&
    !isPartOfFloatingUI &&
    !isNotifications &&
    lastFloatingElement === dialogWrapperEl.value
  ) {
    if (props.persistent) {
      bounce()

      return
    }

    hide()
  }
}

// Animations
function bounce() {
  const _floatingEl = floatingEl.value as HTMLElement

  _floatingEl.addEventListener('animationend', () => {
    _floatingEl.classList.remove('bounce')
  })
  _floatingEl.classList.add('bounce')
}

// Overlay
const isOverlayVisible = computed(() => {
  return !props.noOverlay
})
</script>

<template>
  <Teleport
    v-if="debouncedModel"
    to="body"
  >
    <!-- Overlay -->
    <div
      v-if="isOverlayVisible"
      class="backdrop"
      :class="{ 'is-active': model }"
    />

    <Transition
      appear
      :css="!noTransition"
      :enter-from-class="transitionClass"
      :leave-to-class="transitionClass"
      @before-enter="$emit('beforeShow')"
      @before-leave="$emit('beforeHide')"
      @after-leave="commitHide"
      @after-enter="$emit('show')"
    >
      <div
        v-if="model"
        ref="dialogWrapperEl"
        class="dialog__wrapper floating-element"
        :position="position"
        :style="{ '--dialogMaxHeight': dialogMaxHeight }"
        .hide="hide"
      >
        <!-- Dialog -->
        <div
          ref="floatingEl"
          class="dialog"
          :style="{ '--transitionDuration': `${transitionDuration}ms` }"
          h="120"
          w="100"
          max-h="[min(95%,var(--dialogMaxHeight))]"
          max-w="95vw"
          v-bind="$attrs"
        >
          <!-- Header -->
          <slot
            v-if="$slots.title || $slots.header || title"
            name="header"
            :hide="hide"
          >
            <div
              class="dialog__header"
              :class="ui?.headerClass"
              :style="ui?.headerStyle"
            >
              <!-- Title -->
              <slot
                v-if="$slots.title || $slots.header || title"
                name="title"
                :hide="hide"
              >
                <h6
                  class="dialog__header-title"
                  :class="ui?.titleClass"
                  :style="ui?.titleStyle"
                >
                  {{ title }}
                </h6>
              </slot>

              <Btn
                preset="CLOSE"
                size="sm"
                @click="hide"
              />
            </div>
          </slot>

          <!-- Content -->
          <div
            ref="contentEl"
            flex="~ col grow gap-1"
            overflow="auto"
            rounded="custom"
            :class="ui?.contentClass ?? 'p-1'"
            :style="ui?.contentStyle"
          >
            <slot :hide="hide" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.dialog {
  --apply: flex flex-col max-w-95vw max-h-95% rounded-custom z-1
    border-1 border-ca pointer-events-auto
    bg-white dark:bg-darker;

  &__wrapper {
    --apply: flex fixed inset-0 z-$zDialog pointer-events-none;
  }

  &__header {
    --apply: flex items-center gap-2 p-l-3 p-r-1 p-y-2 rounded-t-custom;
    --apply: bg-$Dialog-title-bg;

    &-title {
      --apply: grow;
    }
  }
}

// Position
.dialog__wrapper[position='top'] {
  --apply: justify-center items-start;

  .dialog {
    --apply: rounded-t-none;
  }
}

.dialog__wrapper[position='bottom'] {
  --apply: justify-center items-end;

  .dialog {
    --apply: rounded-b-none;
  }
}
.dialog__wrapper[position='left'] {
  --apply: justify-start items-center;

  .dialog {
    --apply: rounded-l-none;
  }
}

.dialog__wrapper[position='right'] {
  --apply: justify-end items-center;

  .dialog {
    --apply: rounded-r-none;
  }
}

.dialog__wrapper[position='center'] {
  --apply: flex-center;
}


.v-enter-active,
.v-leave-active {
  --apply: pointer-events-none;
  transition: opacity 0.3s ease,
              transform 0.3s cubic-bezier(0.19, 1, 0.22, 1);
}

// Backdrop
.backdrop {
  --apply: fixed inset-0 transition-background-color z-$zBackdrop
    duration-$transitionDuration ease bg-transparent;

  &.is-active {
    --apply: bg-darker/70;

  }
}

// Bounce
.bounce {
  animation: myBounce 100ms ease-in-out 0s 2 alternate forwards;
}

@keyframes myBounce {
	0% {
		transform: scale(1);
	}

	100% {
		transform: scale(1.05);
	}
}
</style>
