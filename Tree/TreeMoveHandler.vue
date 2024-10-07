<template>
  <div class="tree-move-handler">
    <div class="i-akar-icons:drag-vertical tree-move-handler__icon" />
  </div>
</template>

<style scoped lang="scss">
.tree-move-handler {
  @apply flex flex-center shrink-0 m-t-1 cursor-move;

  &__icon {
    @apply color-ca w-4 h-4 pointer-events-none;
  }
}
</style>
