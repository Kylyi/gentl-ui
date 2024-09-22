<script setup lang="ts">
type IProps = {
  hasNoData: boolean
  isVisible?: boolean
}

defineProps<IProps>()
</script>

<template>
  <div
    v-if="hasNoData"
    class="no-data"
  >
    <Banner
      v-if="isVisible"
      icon-class="!self-center"
      no-dismiss
      :label="$t('general.noData')"
    />
  </div>
</template>

<style lang="scss" scoped>
.no-data {
  @applyflex h-24 p-4 text-caption italic items-start;
}
</style>
