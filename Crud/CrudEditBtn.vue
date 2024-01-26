<script setup lang="ts">
// Injections
import { isFormEditingKey } from '~/components/Form/provide/form.provide'

// Constants
import { BUTTON_PRESET } from '~/components/Button/constants/button-preset.constant'

type IProps = {
  archived?: boolean
  disabled?: boolean
  isEditing?: boolean
  label?: string
  preset?: keyof typeof BUTTON_PRESET

  /**
   * Normally, the edit button interacts with the `Form` it is part of (~ makes it editable)
   * If we want to prevent this, we can set this prop to `true`
   */
  noFormInteraction?: boolean
}

const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'update:isEditing', val: boolean): void
  (e: 'restore'): void
}>()

// Injections
const isFormEditing = injectStrict(isFormEditingKey, ref())

// Layout
const isEditingProp = useVModel(props, 'isEditing', emits)

const isEditing = computed({
  get() {
    return isEditingProp.value || isFormEditing.value
  },
  set(val) {
    isEditingProp.value = !!val
    isFormEditing.value = !!val
  },
})

const transitionProps = computed(() => ({
  enterActiveClass: 'animate-zoom-in animate-duration-250',
  leaveActiveClass: 'animate-fade-out-up animate-duration-350',
}))

const btnProps = computed(() => {
  const preset: keyof typeof BUTTON_PRESET =
    props.preset ?? (props.archived ? 'RESTORE' : 'EDIT')
  const label =
    props.label ?? (props.archived ? $t('general.restore') : $t('general.edit'))

  return { preset, label }
})

function handleClick() {
  if (props.archived) {
    emits('restore')

    return
  }

  isEditing.value = true
}
</script>

<template>
  <Transition v-bind="transitionProps">
    <div
      v-if="!isEditing"
      class="crud-edit-btn-wrapper"
    >
      <Btn
        v-bind="btnProps"
        no-dim
        :disabled="disabled"
        class="crud-edit-btn"
        :class="{ 'is-archived': archived }"
        data-cy="crud-edit-button"
        @click="handleClick"
      />
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.crud-edit-btn {
  --apply: md:min-w-60 w-full m-x-1;

  &:not(.is-archived):not(.is-disabled) {
    --apply: bg-primary color-white;
  }

  &.is-archived {
    --apply: bg-dark-50 color-true-gray-400;
  }

  &-wrapper {
    --apply : absolute inset-block-0 right-0 flex flex-center rounded-inherit
    bg-white dark:bg-darker min-w-full;
  }
}
</style>
