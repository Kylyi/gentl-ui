<script setup lang="ts">
// TYPES
import { ICrudBtnProps } from '~~/components/Crud/types/crud-btn-props.type'

defineProps<ICrudBtnProps>()
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
    @click="noConfirm && $emit('delete')"
  >
    <MenuConfirmation
      v-if="!noConfirm"
      placement="bottom-end"
      :title="$t('delete')"
      @ok="$emit('delete')"
    >
      <slot name="confirmation" />
    </MenuConfirmation>
  </Btn>
</template>
