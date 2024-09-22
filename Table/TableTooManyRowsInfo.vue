<script setup lang="ts">
const tooManyRowsWarningVisible = ref(true)
</script>

<template>
  <div
    v-if="tooManyRowsWarningVisible"
    class="too-many-rows-warning"
  >
    <div>
      {{ $t('table.tooManyData') }}
    </div>

    <Btn
      m="y-2"
      :label="$t('general.understood')"
      size="sm"
      @click="tooManyRowsWarningVisible = false"
    />
  </div>
</template>
¨

<style lang="scss" scoped>
.too-many-rows-warning {
  @apply flex flex-gap-x-2 bg-red color-white items-center justify-between
    p-x-2 m-1 rounded-3;
}
</style>
