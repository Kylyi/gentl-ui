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
  submitConfirmation: config.form.confirmation.enabled,
  focusFirstInput: false,
  preventSubmitOnEnter: config.form.preventSubmitOnEnter,
})

const emits = defineEmits<{
  (e: 'submit', payload?: any): void
  (e: 'update:errors', errors: string[]): void
}>()

// Store
const { lastPointerDownType, activeElement } = storeToRefs(useAppStore())

// Errors
const errors = toRef(props, 'errors', [])
const { errorsExtended, handleDismissError } = useFormErrors(errors, emits)

// Layout
const formEl = ref<HTMLFormElement>()
const menuConfirmationEl = ref<InstanceType<typeof MenuConfirmation>>()
const isSubmitted = ref(false)
const isInEditMode = ref(!!props.isEditing)
provide(formIsInEditModeKey, isInEditMode)

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

  return [...classes, props.controlsClass]
})

const throttledSubmit = useThrottleFn(
  (isConfirmed?: boolean, payload?: any) => {
    if (!isConfirmed && props.submitConfirmation) {
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

// Functions
function focusFirstInput() {
  if (lastPointerDownType?.value === 'mouse' && props.focusFirstInput) {
    const spanElements = formEl?.value?.querySelectorAll(
      'span.wrapper-body__input'
    )

    if (spanElements) {
      for (const spanElement of spanElements) {
        // Check if there is an input child without readonly and required
        const inputChild = spanElement.querySelector(
          '.control:not([readonly]):not([required])'
        ) as HTMLElement

        // If an eligible input child exists, focus on it & break
        if (inputChild) {
          setTimeout(() => {
            inputChild.focus()
          }, 200)

          break
        }
      }
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
    !isCtrlKey &&
    !isInputWithCustomEnterHandler
  ) {
    ev.preventDefault()
  } else if (isCtrlKey) {
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

// For purpose of update form
whenever(isInEditMode, () => {
  // Small delay for waiting for the input to be appended in EDIT modea
  setTimeout(() => {
    focusFirstInput()
  }, 100)
})

onMounted(() => {
  focusFirstInput()
})
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
      <Section
        id="form-controls"
        flex="~ wrap gap-2 items-center"
        shrink-0
        :section-class="[controlsClass, '!p-x-2 !p-b-2']"
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
        >
          <slot name="submit-before" />

          <Btn
            v-if="!noSubmit"
            bg="primary"
            color="white"
            :class="submitClass"
            :disabled="submitDisabled"
            :loading="loading"
            :icon="icon"
            type="submit"
            data-cy="save-button"
            :label="label ?? $t('submit')"
          >
            <Component
              :is="FormConfirmation"
              v-if="submitConfirmation"
              ref="menuConfirmationEl"
              :confirmation-text="submitConfirmationText"
              @ok="throttledSubmit(true, $event)"
            >
              <template #append>
                <slot name="confirmation"> </slot>
              </template>
            </Component>
          </Btn>

          <slot name="submit-after" />
        </div>
      </Section>
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
