<script setup lang="ts">
// Types
import { type ICrudBtnProps } from '~/components/Crud/types/crud-btn-props.type'

defineProps<ICrudBtnProps & { confirmationText?: string }>()
defineEmits<{
  (e: 'delete'): void
}>()
</script>

<template>
  <Btn
    preset="TRASH"
    :label="labels && (label || $t('general.delete'))"
    :loader-type="loaderType"
    :loading="loading"
    no-dim
    :size="size"
    :outlined="outlined"
    :no-uppercase="noUppercase"
    :disabled="disabled"
    tabindex="-1"
    data-cy="delete-button"
    @click="noConfirm && $emit('delete')"
  >
    <MenuConfirmation
      v-if="!noConfirm"
      :title="$t('general.delete')"
      :confirmation-text="confirmationText"
      placement="bottom-start"
      no-uplift
      no-overlay
      focus-confirm-button
      h="auto"
      @ok="$emit('delete')"
    >
      <slot name="confirmation" />
    </MenuConfirmation>

    <slot />
  </Btn>
</template>
