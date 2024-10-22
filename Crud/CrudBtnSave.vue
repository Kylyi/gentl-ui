<script setup lang="ts">
// Types
import type { ICrudBtnProps } from '~/components/Crud/types/crud-btn-props.type'

defineProps<ICrudBtnProps>()
defineEmits<{
  (e: 'save'): void
}>()
</script>

<template>
  <Btn
    preset="SAVE"
    :label="labels && $t('general.save')"
    :loader-type="loaderType"
    :loading="loading"
    no-dim
    :disabled="disabled"
    @click="$emit('save')"
  />
</template>
