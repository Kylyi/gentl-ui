<script setup lang="ts">
type IProps = {
  pad?: boolean
  loading?: boolean
}

withDefaults(defineProps<IProps>(), {
  pad: true,
})

const mounted = ref(false)

onMounted(() => {
  setTimeout(() => (mounted.value = true), 250)
})
</script>

<template>
  <main
    class="page-wrapper"
    :class="{
      'is-scrollable': $route.meta.isPageScrollable,
      'is-mounted': mounted,
      'is-padded': pad,
    }"
  >
    <slot v-if="!loading" />

    <slot
      v-else
      name="loading"
    >
      <div
        flex="~ center"
        fit
      >
        <Loader />
      </div>
    </slot>
  </main>
</template>

<style lang="scss" scoped>
.page-wrapper {
  --apply: ease-out overflow-auto grow;

  &.is-mounted {
    --apply: transition-padding-250;
  }

  &:not(.is-scrollable) {
    --apply: overflow-auto flex flex-col;
  }

  &.is-padded {
    --apply: m-t-$navHeight;
  }
}

.page-drawer.is-open.page-drawer--left:not(.is-absolute) ~ .page-wrapper {
  padding-left: var(--drawerLeftMiniWidth);
}

.page-drawer.is-open.page-drawer--left:not(.is-absolute):not(.is-mini)
  ~ .page-wrapper {
  padding-left: var(--drawerLeftWidth);
}

.page-drawer.is-open.page-drawer--right:not(.is-absolute) ~ .page-wrapper {
  padding-right: var(--drawerRightMiniWidth);
}

.page-drawer.is-open.page-drawer--right:not(.is-absolute):not(.is-mini)
  ~ .page-wrapper {
  padding-right: var(--drawerRightWidth);
}
</style>
