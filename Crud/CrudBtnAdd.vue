<script setup lang="ts">
import type { RouteLocationRaw } from '#vue-router'

// Types
import type { ICrudBtnProps } from '~/components/Crud/types/crud-btn-props.type'

type IProps = ICrudBtnProps & {
  to?: RouteLocationRaw
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
    :label="labels && (label || $t('general.add'))"
    :loader-type="loaderType"
    :loading="loading"
    :to="to"
    no-dim
    :no-uppercase="noUppercase"
    :size="size"
    data-cy="add-button"
  />
</template>
