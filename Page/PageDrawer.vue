<script setup lang="ts">
// Types
import type { IPageDrawerProps } from '~/components/Page/types/page-drawer-props.type'

// Constants
import { $bp } from '~/libs/App/constants/breakpoints.constant'

const props = withDefaults(defineProps<IPageDrawerProps>(), {
  absoluteBreakpoint: 'md',
  absoluteFullWidthBreakpoint: 'md',
  side: 'left',
  width: 280,
  miniWidth: 64,
})
const emits = defineEmits<{
  (e: 'update:model-value', val: boolean): void
  (e: 'update:mini', val: boolean): void
}>()

// Mini mode
const miniOriginal = useVModel(props, 'mini', emits)
const miniLocal = ref(!!miniOriginal.value)

const isMini = computed(() => miniLocal.value)

function toggleMini() {
  miniLocal.value = !miniLocal.value
  miniOriginal.value = miniLocal.value
}

watch(miniOriginal, mini => (miniLocal.value = mini))

// Layout
const pageDrawerClasses = computed(() => {
  return [
    `page-drawer--${props.side}`,
    `${isMini.value ? 'w-$drawerMiniWidth' : 'w-$drawerWidth'}`,
    {
      'is-mini': isMini.value,
      'is-open': props.modelValue,
      'is-absolute': !$bp[props.absoluteBreakpoint].value,
      'is-absolute-full-width':
        !isMini.value && !$bp[props.absoluteFullWidthBreakpoint].value,
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
    <div
      v-if="!fullHeight"
      class="page-drawer-filler"
    />

    <div
      class="page-drawer-content"
      :class="contentClass"
    >
      <slot :mini="isMini" />
    </div>

    <div
      v-if="!noBottom"
      class="page-drawer-bottom"
      :class="bottomClass"
    >
      <slot
        name="bottom"
        :is-mini="isMini"
        :toggle-mini="toggleMini"
      >
        <Btn
          preset="CHEVRON_RIGHT"
          :ripple="false"
          w="!full"
          class="!color-black !dark:color-white"
          :class="{ 'rotate-180': !isMini }"
          @click="toggleMini"
        />
      </slot>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
header.is-hidden ~ .page-drawer {
  .page-drawer-filler {
    @apply bg-light dark:bg-dark;
  }
}

.page-drawer {
  @apply h-full fixed flex flex-col z-$zLayoutDrawer pointer-events-none
    ease-out;

  @apply print:hidden;

  transition-property: width transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;

  &-filler {
    @apply relative shrink-0 border-b-1 border-true-gray/10;

    height: max(52px, var(--navHeight));
  }

  &.is-absolute {
    .drawer-filler {
      @apply shrink-0;
    }
  }

  &.is-absolute-full-width {
    @apply w-full;
  }

  &-content {
    @apply flex flex-col flex-grow overflow-auto pointer-events-auto;
    @apply bg-$PageDrawer-content-bg;
  }

  &-bottom {
    @apply flex shrink-0 overflow-auto pointer-events-auto;
    @apply bg-$PageDrawer-content-bg;
  }

  &--left {
    @apply translate-x--100%;

    &.is-open {
      @apply translate-x-0;
    }
  }

  &--right {
    @apply right-0 order-2 translate-x-100%;

    &.is-open {
      @apply translate-x-0;
    }

    @screen page {
      margin-right: calc(calc(100% - var(--pageWidth)) / 2);
    }
  }
}
</style>
