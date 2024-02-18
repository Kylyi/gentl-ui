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
    data-cy="delete-button"
    @click="noConfirm && $emit('delete')"
  >
    <MenuConfirmation
      v-if="!noConfirm"
      placement="bottom-end"
      :title="$t('general.delete')"
      :confirmation-text="confirmationText"
      no-uplift
      no-overlay
      h="auto"
      @ok="$emit('delete')"
    >
      <slot name="confirmation" />
    </MenuConfirmation>
  </Btn>
</template>
