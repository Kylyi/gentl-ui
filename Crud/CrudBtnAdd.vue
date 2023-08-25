<script setup lang="ts">
// TYPES
import type { IBtnProps } from '~~/components/Button/types/btn-props.type'
import type { ICrudBtnProps } from '~~/components/Crud/types/crud-btn-props.type'

type IProps = ICrudBtnProps & {
  to?: IBtnProps['to']
}

withDefaults(defineProps<IProps>(), {
  loaderType: 'block',
})
</script>

<template>
  <Btn
    preset="ADD"
    bg="primary"
    color="!white"
    :label="labels && (label || $t('new2'))"
    :loader-type="loaderType"
    :loading="loading"
    :to="to"
    no-dim
    :no-uppercase="noUppercase"
    :size="size"
  />
</template>
