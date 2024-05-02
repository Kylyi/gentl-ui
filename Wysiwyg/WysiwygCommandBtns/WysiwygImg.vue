<script setup lang="ts">
defineEmits<{
  (e: 'set-image'): void
}>()
</script>

<template>
  <div flex="~">
    <Btn
      icon="i-ion:image-outline"
      size="sm"
      color="ca"
      @click.stop.prevent="$emit('set-image')"
      @mousedown.stop.prevent
    />
  </div>
</template>
