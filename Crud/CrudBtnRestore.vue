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
    preset="RESTORE"
    :label="labels && $t('general.restore')"
    :loader-type="loaderType"
    :loading="loading"
    :to="to"
  />
  no-dim
</template>
