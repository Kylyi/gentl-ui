<script setup lang="ts">
// Types
import type { ICrudBtnProps } from '~/components/Crud/types/crud-btn-props.type'

type IProps = ICrudBtnProps & {
  to?: any // should be RouteLocationRaw but that breaks some projects for whatever reason
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
    :icon="icon"
    :disabled="disabled"
  />
</template>
