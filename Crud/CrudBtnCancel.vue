<script setup lang="ts">
// Injections
import { isFormEditingKey } from '~/components/Form/provide/form.provide'

type IProps = {
  disabled?: boolean
  isEditing?: boolean
  label?: string

  /**
   * Normally, the edit button interacts with the `Form` it is part of (~ makes it editable)
   * If we want to prevent this, we can set this prop to `true`
   */
  noFormInteraction?: boolean

  /**
   * Function to call when the cancellation happens
   */
  reset?: () => void
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

    if (!val) {
      props.reset?.()
    }
  },
})
</script>

<template>
  <Btn
    preset="CLOSE"
    size="sm"
    w="40"
    :label="$t('general.cancel')"
    @click="isEditing = false"
  >
    <slot />
  </Btn>
</template>
