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
    preset="RESTORE"
    :label="labels && $t('general.restore')"
    :loader-type="loaderType"
    :loading="loading"
    :to="to"
  />
  no-dim
</template>
