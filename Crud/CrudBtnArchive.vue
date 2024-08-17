<script setup lang="ts">
// Types
import type { ICrudBtnProps } from '~/components/Crud/types/crud-btn-props.type'

type IProps = ICrudBtnProps & { isArchived?: boolean }

const props = withDefaults(defineProps<IProps>(), {
  loaderType: 'block',
})

defineEmits<{
  (e: 'archive'): void
}>()

// Layout
const label = computed(() => {
  if (!props.labels) {
    return
  }

  return props.isArchived
    ? $t('general.restore')
    : $t('general.archive')
})
</script>

<template>
  <Btn
    :preset="isArchived ? 'RESTORE' : 'ARCHIVE'"
    :label
    :loader-type
    :loading
    no-dim
    no-uppercase
  >
    <MenuConfirmation
      placement="bottom"
      :title="label"
      @ok="$emit('archive')"
    >
      <slot name="confirmation" />
    </MenuConfirmation>
  </Btn>
</template>
