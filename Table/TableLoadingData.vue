<script setup lang="ts">
type IProps = {
  rows?: any[]
}

const props = defineProps<IProps>()

const hasRows = computed(() => props.rows && props.rows?.length > 0)
</script>

<template>
  <div
    class="loading"
    :class="{ 'is-absolute': hasRows }"
    data-cy="loading-table"
  >
    <LoaderInline
      size="sm"
      min-w="70"
      backdrop="blur-sm"
    />
  </div>
</template>

<style lang="scss" scoped>
.loading {
  --apply: flex flex-center;

  &.is-absolute {
    --apply: absolute inset-inline-0 bottom-0;
  }
}
</style>
