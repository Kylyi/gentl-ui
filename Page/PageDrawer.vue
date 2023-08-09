<script setup lang="ts">
// TYPES
import type { IPageDrawerProps } from '~~/components/Page/types/page-drawer-props.type'

// COMPOSITION FUNCTIONS
import { usePageWidth } from '~/layouts/functions/usePageWidth'

const props = withDefaults(defineProps<IPageDrawerProps>(), {
  breakpoint: 'sm',
  side: 'left',
  width: 280,
  miniWidth: 64,
})
const emits = defineEmits<{
  (e: 'update:model-value', val: boolean): void
  (e: 'update:mini', val: boolean): void
}>()

// UTILS
const { isPageWidth } = usePageWidth()

// MINI
const miniLocal = ref(props.mini)
const mini = useVModel(props, 'mini', emits)

const isMini = computedEager(() => miniLocal.value && isPageWidth.value)

function toggleMini() {
  emits('update:mini', !miniLocal.value)
  miniLocal.value = !miniLocal.value
}

watch(mini, mini => (miniLocal.value = mini))

// LAYOUT
const pageDrawerClasses = computedEager(() => {
  return [
    'lt-md:w-full',
    `page-drawer--${props.side}`,
    `${isMini.value ? 'w-$drawerMiniWidth' : 'w-$drawerWidth'}`,
    {
      'is-mini': isMini.value,
      'is-open': props.modelValue,
      'is-absolute': $bp.isSmaller('lg'),
    },
  ]
})
</script>

<template>
  <aside
    class="page-drawer"
    :class="pageDrawerClasses"
    :style="{
      [`--drawerWidth`]: `${width}px`,
      [`--drawerMiniWidth`]: `${miniWidth}px`,
    }"
  >
    <div class="page-drawer-filler" />

    <div class="page-drawer-content">
      <slot :mini="isMini" />
    </div>

    <div class="page-drawer-bottom">
      <Btn
        preset="CHEVRON_RIGHT"
        :ripple="false"
        w="!full"
        class="!color-black !dark:color-white"
        :class="{ 'rotate-180': !isMini }"
        @click="toggleMini"
      />
    </div>
  </aside>
</template>

<style lang="scss" scoped>
header.is-hidden ~ .page-drawer {
  .page-drawer-filler {
    --apply: bg-light dark:bg-dark;
  }
}

.page-drawer {
  --apply: h-100% fixed flex flex-col z-$zLayoutDrawer pointer-events-none
    ease-out;

  transition:
    width 250ms,
    transform 250ms;

  &-filler {
    --apply: relative shrink-0 border-b-1 border-true-gray/10;

    height: max(52px, var(--navHeight));
  }

  &.is-absolute {
    .drawer-filler {
      --apply: shrink-0;
    }
  }

  &-content {
    --apply: flex flex-col flex-grow overflow-auto pointer-events-auto bg-ca;
  }

  &-bottom {
    --apply: flex flex-shrink-0 pointer-events-auto flex-center p-2 w-full bg-ca
      border-t-1 border-ca lt-page:display-none;

    // Project specific
    // --apply: '!display-none';
  }

  &--left {
    --apply: translate-x--100%;

    &.is-open {
      --apply: translate-x-0;
    }
  }

  &--right {
    --apply: right-0 order-2 translate-x-100%;

    &.is-open {
      --apply: translate-x-0;
    }

    @media screen and (min-width: 1536px) {
      margin-right: calc(calc(100% - var(--pageWidth)) / 2);
    }
  }
}
</style>
