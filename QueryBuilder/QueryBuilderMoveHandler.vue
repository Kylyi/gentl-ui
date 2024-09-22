<template>
  <div class="query-builder-move-handler">
    <div class="i-akar-icons:drag-vertical query-builder-move-handler__icon" />
  </div>
</template>

<style scoped lang="scss">
.query-builder-move-handler {
  @applyflex flex-center shrink-0;

  &__icon {
    @applycolor-ca w5 h-5 cursor-move;
  }
}
</style>
