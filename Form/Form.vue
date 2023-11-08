<script setup lang="ts">
import { config } from '~/config'

// Types
import type { IFormProps } from '~/components/Form/types/form-props.type'

// Functions
import { useFormErrors } from '~/components/Form/functions/useFormErrors'
import { useAppStore } from '~/libs/App/app.store'

// Components
import MenuConfirmation from '~/components/MenuConfirmation/MenuConfirmation.vue'

// Injections
import { formIsInEditModeKey } from '~/components/Form/provide/form.provide'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<IFormProps>(), {
  errorsOnTop: true,
  labelForcedVisibility: true,
  hasControls: undefined,
  submitConfirmation: undefined,
  focusFirstInput: false,
  preventSubmitOnEnter: config.form.preventSubmitOnEnter,
})

const emits = defineEmits<{
  (e: 'submit', payload?: any): void
  (e: 'update:errors', errors: string[]): void
  (e: 'update:isEditing', val: boolean): void
}>()

// Store
const appStore = useAppStore()
const { appState, lastPointerDownType, activeElement } = storeToRefs(appStore)

// Errors
const errors = toRef(props, 'errors', [])
const { errorsExtended, handleDismissError } = useFormErrors(errors, emits)

// Layout
const formEl = ref<HTMLFormElement>()
const menuConfirmationEl = ref<InstanceType<typeof MenuConfirmation>>()
const isSubmitted = ref(false)
const isEditing = defineModel('isEditing', { default: false, local: true })
const { isDesktop } = useDevice()
provide(formIsInEditModeKey, isEditing)

const formConfirmation = computed(() => {
  // When set in code, we want to use the value from the code
  if (props.submitConfirmation !== undefined) {
    return props.submitConfirmation
  }

  // When we don't allow people to edit the confirmation we just use whatever is
  // in the config
  const isEditable = config.form.confirmation.editable

  if (!isEditable) {
    return config.form.confirmation.enabled
  }

  // Otherwise, we use the value from the app state (with fallback to config)
  const isEnabled =
    !!appState.value.form?.confirmation?.enabled ||
    config.form.confirmation.enabled

  return isEnabled
})

const preventSubmitOnEnter = computed(() => {
  return !!props.preventSubmitOnEnter
})

const FormConfirmation = computed(() => {
  return config.form?.confirmation?.component ?? MenuConfirmation
})

const formClass = computed(() => ({
  'form--dense': props.dense,
  'is-bordered': props.bordered,
  'is-submitted': isSubmitted.value,
  'has-controls-on-top': props.controlsOnTop,
  'is-grown': !props.noGrow,
  'is-label-forced-visible': props.labelForcedVisibility,
}))

const controlsClass = computed(() => {
  const classes = [
    'w-full border-ca !rounded-0 bg-white dark:bg-darker',
    'lt-lg:p-x-2 sticky bottom-0 inset-inline-0',
  ]

  if (props.controlsOnTop) {
    classes.push('order--1 border-b-1')
  } else {
    classes.push('border-t-1')
  }

  return [...classes, props.ui?.controlsClass]
})

// Keyboard shortcuts
onKeyStroke(['e', 'E'], (ev: KeyboardEvent) => {
  // When using CTRL or META, we return back to readonly mode
  const isControlKey = ev.ctrlKey || ev.metaKey

  if (isControlKey) {
    ev.preventDefault()
    isEditing.value = false
    menuConfirmationEl.value?.hide()

    return
  }

  // When `e` is pressed, we want to enter the edit mode
  const isFocusedInInput = appStore.isActiveElementInput()

  if (isFocusedInInput) {
    return
  }

  isEditing.value = true
})

// Functions
const throttledSubmit = useThrottleFn(
  async (isConfirmed?: boolean, payload?: any) => {
    if (!isConfirmed && formConfirmation.value) {
      const isValid = await $v.value.$validate()

      if (!isValid) {
        notify($t('form.invalid'), 'negative')

        return
      }

      menuConfirmationEl.value?.show()
      menuConfirmationEl.value?.focusConfirmButton?.()

      return
    }

    if (!props.loading && !props.submitDisabled) {
      emits('submit', payload)
    }

    isSubmitted.value = true
  },
  500,
  true,
  true
)

function focusFirstInput() {
  // We only focus the first input if the last pointer down type was a mouse
  // because on touch devices, it would most likely open a virtual keyboard
  // which might take unnecessary space on the screen
  const shouldFocus =
    lastPointerDownType?.value === 'mouse' ||
    (isDesktop && !lastPointerDownType.value)

  if (shouldFocus && props.focusFirstInput) {
    const spanElements =
      formEl?.value?.querySelectorAll('span.wrapper-body__input') || []

    const firstEditableField = Array.from(spanElements).find(el => {
      const inputChild = el.querySelector(
        '.control:not([readonly]):not([disabled])'
      ) as HTMLElement

      return !!inputChild
    }) as HTMLElement

    const firstEditableInput = firstEditableField?.querySelector(
      '.control:not([readonly]):not([disabled])'
    ) as HTMLElement

    if (firstEditableInput) {
      firstEditableInput.focus()
      // We only want to focus the input if it's currently visible because
      // we don't want to scroll the page to the input if it's not visible
      // const { stop } = useIntersectionObserver(firstEditableInput, observer => {
      //   setTimeout(() => {
      //     if (observer[0].isIntersecting) {
      //       firstEditableInput.focus()
      //     }
      //     // We deactivate the intersection observer
      //     stop()
      //   }, 200)
      // })
    }
  }
}

function handleEnter(ev: KeyboardEvent) {
  const isCtrlKey = ev.ctrlKey || ev.metaKey
  const isInput = activeElement.value?.tagName === 'INPUT'
  const hasCustomEnterHandler =
    activeElement.value?.classList.contains('custom-enter')

  const isInputWithCustomEnterHandler = isInput && hasCustomEnterHandler

  if (
    preventSubmitOnEnter.value &&
    isInput &&
    !isCtrlKey &&
    !isInputWithCustomEnterHandler
  ) {
    ev.preventDefault()
  } else if (isCtrlKey && !props.submitDisabled) {
    throttledSubmit()
  }
}

defineExpose({
  submit: throttledSubmit,
  fakeSubmit: () => (isSubmitted.value = true),
  reset: () => formEl.value?.reset(),
  recomputeConfirmationMenuPosition: () => {
    menuConfirmationEl.value?.recomputeMenuPosition()
  },
})

// When triggering the edit mode, we want to focus the first input
whenever(isEditing, () => {
  // Small delay for waiting for the input to be appended in EDIT modea
  setTimeout(() => {
    focusFirstInput()
  }, 100)
})

// We also try to focus the first input when the form is mounted
onMounted(() => {
  focusFirstInput()
})

// Validation
const $v = useVuelidate()
</script>

<template>
  <form
    ref="formEl"
    class="form"
    :class="formClass"
    autocomplete="off"
    novalidate
    @submit.stop.prevent="throttledSubmit()"
    @keydown.enter="handleEnter"
  >
    <slot name="above" />

    <div
      class="form-content"
      rounded="custom"
      overflow="auto"
      :class="{ 'flex flex-col': !$attrs.grid }"
      v-bind="$attrs"
    >
      <slot />
    </div>

    <slot name="errors">
      <Section
        v-if="errorsExtended.length"
        flex="~ col gap-y-2"
        :section-class="{
          'order--1': !!errorsOnTop,
        }"
      >
        <Banner
          v-for="error in errorsExtended"
          :key="error.idx"
          type="error"
          dismissable
          icon-class="!self-center"
          :counter="error.count"
          :label="$t(error.errorText)"
          @dismiss="handleDismissError(error)"
        />
      </Section>
    </slot>

    <slot
      v-if="!noControls && hasControls !== false"
      name="submit"
    >
      <div
        id="form-controls"
        flex="~ wrap gap-2 items-center shrink-0"
        p="2"
        :class="controlsClass"
      >
        <slot
          v-if="$slots['submit-start']"
          name="submit-start"
        >
          <span>&nbsp;</span>
        </slot>

        <!-- Spacer -->
        <div grow />

        <div
          relative
          flex="~ gap-2"
          :class="ui?.submitWrapperClass"
        >
          <slot name="submit-before" />

          <Btn
            v-if="!noSubmit"
            bg="primary"
            color="white"
            :class="ui?.submitClass"
            :disabled="submitDisabled"
            :loading="loading"
            :icon="icon"
            type="submit"
            data-cy="save-button"
            :label="label ?? $t('submit')"
          >
            <Component
              :is="FormConfirmation"
              v-if="formConfirmation"
              ref="menuConfirmationEl"
              manual
              :confirmation-text="submitConfirmationText"
              @ok="throttledSubmit(true, $event)"
            >
              <template #append>
                <slot name="confirmation"> </slot>
              </template>
            </Component>

            <slot name="submit-btn" />
          </Btn>

          <slot name="submit-after" />
        </div>
      </div>
    </slot>
  </form>
</template>

<style lang="scss" scoped>
.form {
  &-content {
    --apply: flex-gap-2;
  }

  &.is-grown {
    --apply: contents;

    > .form-content {
      --apply: flex-grow;
    }
  }

  &.is-bordered {
    --apply: border-2 border-ca;
  }

  &:not(.is-label-forced-visible) {
    :deep(#form-controls .btn-label) {
      --apply: lt-lg:hidden;
    }

    :deep(#form-controls .btn) {
      --apply: lt-lg:p-x-0;
    }
  }

}
</style>
