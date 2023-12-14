<script setup lang="ts">
// Types
import type { ICrudBtnProps } from '~/components/Crud/types/crud-btn-props.type'

type IProps = ICrudBtnProps

withDefaults(defineProps<IProps>(), {
  loaderType: 'block',
})
defineEmits<{
  (e: 'archive'): void
}>()
</script>

<template>
  <Btn
    preset="ARCHIVE"
    :label="labels && $t('archive')"
    :loader-type="loaderType"
    :loading="loading"
    no-dim
  >
    <MenuConfirmation
      placement="bottom"
      :title="$t('archive')"
      @ok="$emit('archive')"
    >
      <slot name="confirmation" />
    </MenuConfirmation>
  </Btn>
</template>
