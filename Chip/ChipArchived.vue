<script setup lang="ts">
// CONSTANTS
import { BUTTON_PRESET } from '~/components/Button/constants/button-preset.constant'

type IProps = {
  placement?: 'top-right' | 'middle-right'
}

defineProps<IProps>()
</script>

<template>
  <Chip
    :icon="BUTTON_PRESET.ARCHIVE.icon"
    bg="dark-50"
    color="true-gray-400"
    :class="`is-${placement}`"
    :label="$t('archived')"
    h-8
  />
</template>

<style scoped lang="scss">
.is-top-right {
  --apply: absolute top-0 right-0;
}
</style>
