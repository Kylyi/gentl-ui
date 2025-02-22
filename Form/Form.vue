<script setup lang="ts">
import { config } from '~/components/config/components-config'

// Functions
import { getComponentProps } from '~/components/__helpers/get-config-props'
import { useFormErrors } from '~/components/Form/functions/useFormErrors'

// Injections
import { formSubmitKey, isFormEditingKey } from '~/components/Form/provide/form.provide'

// Types
import type { IFormProps } from '~/components/Form/types/form-props.type'

// Components
import MenuConfirmation from '~/components/MenuConfirmation/MenuConfirmation.vue'

// Store
import { useAppStore } from '~/libs/App/app.store'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<IFormProps>(), {
  ...getComponentProps('form'),
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

// Utils
const { isDesktop } = useDevice()

// Layout
const formEl = ref<HTMLFormElement>()
const menuConfirmationEl = ref<InstanceType<typeof MenuConfirmation>>()
const isSubmitted = ref(false)
const isEditing = defineModel('isEditing', { default: false })

provide(isFormEditingKey, isEditing)

function isElementInViewport(el: Element) {
  const rect = el.getBoundingClientRect()

  return (
    rect.top >= 0
    && rect.left >= 0
    && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    && rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

const formConfirmation = computed(() => {
  // When set in code, we want to use the value from the code
  if (props.submitConfirmation !== undefined) {
    return props.submitConfirmation
  }

  if (!('form' in config && 'confirmation' in config.form)) {
    return
  }

  // When we don't allow people to edit the confirmation we just use whatever is
  // in the config
  const isEditable = config.form.confirmation.editable

  if (!isEditable) {
    return config.form.confirmation.enabled
  }

  // Otherwise, we use the value from the app state
  const isEnabled = !!appState.value.form?.confirmation?.enabled

  return isEnabled
})

const preventSubmitOnEnter = computed(() => {
  return !!props.preventSubmitOnEnter
})

const editControls = computed(() => {
  if (props.noEditControls || !props.editControls) {
    return
  }

  return {
    cancel: props.editControls === true || props.editControls?.cancel,
    edit: props.editControls === true || props.editControls?.edit,
  }
})

const hasKeyboardShortcuts = computed(() => {
  if (!isNil(props.noShortcuts)) {
    return !props.noShortcuts
  }

  if (!isNil(appState.value.general?.keyboardShortcuts)) {
    return appState.value.general?.keyboardShortcuts
  }

  return false
})

const FormConfirmation = computed(() => {
  if (config.form?.confirmation.component) {
    return typeof config.form.confirmation.component === 'function'
    // @ts-expect-error idk
      ? config.form.confirmation.component()
      : config.form.confirmation.component
  }

  return MenuConfirmation
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
    'w-full border-ca bg-white dark:bg-darker',
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
onKeyStroke(['e', 'E'], ev => {
  // When using CTRL or META, we return back to readonly mode
  const isControlKey = ev.ctrlKey || ev.metaKey

  if (isControlKey) {
    ev.preventDefault()
    isEditing.value = false
    menuConfirmationEl.value?.hide()
    activeElement.value?.blur?.()
    props.reset?.()

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
const throttledSubmit = useThrottleFn((isConfirmed?: boolean, payload?: any) => {
  if (!isConfirmed && formConfirmation.value) {
    menuConfirmationEl.value?.show()
    menuConfirmationEl.value?.focusConfirmButton?.()

    return
  }

  if (!props.loading && !props.submitDisabled) {
    emits('submit', payload)
  }

  isSubmitted.value = true
}, 500, false, true)

function focusFirstInput() {
  // We only focus the first input if the last pointer down type was a mouse
  // because on touch devices, it would most likely open a virtual keyboard
  // which might take unnecessary space on the screen
  const shouldFocus = lastPointerDownType?.value === 'mouse' || (isDesktop && !lastPointerDownType.value)

  if (shouldFocus && props.focusFirstInput) {
    const inputElements = formEl?.value?.querySelectorAll('.wrapper__body') || []

    const firstEditableField = Array.from(inputElements).find(el => {
      const inputChild = el.querySelector('.control:not([readonly]):not([disabled])') as HTMLElement

      return !!inputChild
    }) as HTMLElement

    const firstEditableInput = firstEditableField?.querySelector('.control:not([readonly]):not([disabled])') as HTMLElement

    if (firstEditableInput) {
      const isInViewPort = isElementInViewport(firstEditableInput)

      if (isInViewPort) {
        firstEditableInput.focus()
      }
    }
  }
}

function handleEnter(ev: KeyboardEvent) {
  const isCtrlKey = ev.ctrlKey || ev.metaKey
  const isInput = activeElement.value?.tagName === 'INPUT'
  const hasCustomEnterHandler = activeElement.value?.classList.contains('custom-enter')

  const isInputWithCustomEnterHandler = isInput && hasCustomEnterHandler

  if (
    preventSubmitOnEnter.value
    && isInput
    && !isCtrlKey
    && !isInputWithCustomEnterHandler
  ) {
    ev.preventDefault()
  } else if (isCtrlKey && !props.submitDisabled) {
    activeElement.value?.blur?.()
    throttledSubmit()
  }
}

provide(formSubmitKey, throttledSubmit)

defineExpose({
  submit: throttledSubmit,
  fakeSubmit: () => (isSubmitted.value = true),
  reset: () => formEl.value?.reset(),
  recomputeConfirmationMenuPosition: () => menuConfirmationEl.value?.recomputeMenuPosition(),
})

// When triggering the edit mode, we want to focus the first input
whenever(isEditing, () => {
  // We need a timeout to
  // 1. Wait for the form to be rendered
  // 2. Potentially prevent the `e` key being inputted into the input
  setTimeout(() => focusFirstInput())
})

// We also try to focus the first input when the form is mounted
onMounted(() => {
  setTimeout(() => focusFirstInput())
})
</script>

<template>
  <form
    ref="formEl"
    class="form"
    :class="formClass"
    autocomplete="off"
    novalidate
    .handleEnter="handleEnter"
    @submit.stop.prevent="throttledSubmit()"
    @keydown.enter="handleEnter"
  >
    <slot name="above" />

    <div
      class="form-content"
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
        :section-class="{ 'order--1': !!errorsOnTop }"
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
      :submit="throttledSubmit"
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

        <!-- Spacer (will make sure the submit button is always to the right) -->
        <div
          v-if="!ui?.noSpacer"
          grow
        />

        <!-- Controls -->
        <div
          relative
          flex="~ gap-2"
          :class="ui?.submitWrapperClass"
        >
          <!-- Cancel button -->
          <CrudBtnCancel
            v-if="editControls?.cancel"
            :class="[ui?.cancelClass, { invisible: !isEditing }]"
            :reset
            v-bind="cancelBtnProps"
            data-onboarding="form-cancel-btn"
          >
            <KeyboardShortcut
              v-if="hasKeyboardShortcuts"
              char="E"
              with-ctrl
              class="!absolute top--1 right-1"
            />
          </CrudBtnCancel>

          <slot name="submit-before" />

          <!-- Submit button -->
          <Btn
            v-if="!noSubmit"
            bg="primary"
            color="white"
            w="40"
            :class="[
              ui?.submitClass,
              { invisible: !isEditing && !!editControls },
            ]"
            :disabled="submitDisabled"
            :loading
            :icon
            :label="label ?? $t('general.submit')"
            v-bind="submitBtnProps"
            type="submit"
            data-cy="save-button"
            data-onboarding="form-save-btn"
          >
            <Component
              :is="FormConfirmation"
              v-if="formConfirmation"
              ref="menuConfirmationEl"
              manual
              :confirmation-text="submitConfirmationText"
              placement="top"
              @ok="throttledSubmit(true, $event)"
            >
              <template #append>
                <slot name="confirmation" />
              </template>
            </Component>

            <slot name="submit-btn" />

            <KeyboardShortcut
              v-if="hasKeyboardShortcuts"
              with-ctrl
              char="&#9166;"
              class="!absolute top--1 right-1"
            />
          </Btn>

          <!-- Edit button -->
          <CrudEditBtn v-if="editControls?.edit">
            <KeyboardShortcut
              v-if="hasKeyboardShortcuts"
              char="E"
              class="!absolute top--1 right-1"
            />
          </CrudEditBtn>

          <slot name="submit-after" />
        </div>
      </div>
    </slot>
  </form>
</template>

<style lang="scss" scoped>
.form {
  &-content {
    @apply flex-gap-2 border-ca;
  }

  > .form-content {
    @apply p-$Form-content-padding;
  }

  &.is-grown {
    @apply contents;

    > .form-content {
      @apply flex-grow;
    }
  }

  &.is-bordered {
    > .form-content {
      @apply border-x-2 border-t-2 border-ca;
    }

    > #form-controls {
      @apply border-x-2 border-b-2 border-ca rounded-b-custom;

      z-index: calc(var(--zDrawer) - 1);
    }
  }

  &:not(.is-label-forced-visible) {
    :deep(#form-controls .btn-label) {
      @apply lt-lg:hidden;
    }

    :deep(#form-controls .btn) {
      @apply lt-lg:p-x-0;
    }
  }
}
</style>
