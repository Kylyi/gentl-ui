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
    :label="labels && (label || $t('delete'))"
    :loader-type="loaderType"
    :loading="loading"
    no-dim
    :size="size"
    :no-uppercase="noUppercase"
    :disabled="disabled"
    data-cy="delete-button"
    @click="noConfirm && $emit('delete')"
  >
    <MenuConfirmation
      v-if="!noConfirm"
      placement="bottom-end"
      :title="$t('delete')"
      :confirmation-text="confirmationText"
      @ok="$emit('delete')"
    >
      <slot name="confirmation" />
    </MenuConfirmation>
  </Btn>
</template>
