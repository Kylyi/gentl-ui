<script setup lang="ts">
// Types
import type { RouteLocationRaw } from '#vue-router'
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
    preset="RESTORE"
    :label="labels && $t('forms.restore')"
    :loader-type="loaderType"
    :loading="loading"
    :to="to"
    no-dim
  />
</template>
