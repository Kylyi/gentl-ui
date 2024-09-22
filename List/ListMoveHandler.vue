<template>
  <div class="list-move-handler">
    <div class="i-akar-icons:drag-vertical list-move-handler__icon" />
  </div>
</template>

<style scoped lang="scss">
.list-move-handler {
  @applyflex flex-center shrink-0;

  &__icon {
    @applycolor-ca w5 h-5 cursor-move;
  }
}
</style>
