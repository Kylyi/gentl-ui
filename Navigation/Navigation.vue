<script setup lang="ts">
defineProps<{
  noAccountBtn?: boolean
}>()

defineEmits<{
  (e: 'toggle-drawer'): void
}>()

// INJECTIONS
const rightDrawer = inject('rightDrawer', ref(false))
const leftDrawer = inject('leftDrawer', ref(false))

// LAYOUT
const isInitialized = ref(false)

// SCROLL UTILS
const lastScrollDirection = ref<'up' | 'down'>('down')
const { arrivedState, y, directions } = useScroll(
  () => (process.client ? window : null),
  { throttle: 10 }
)

const isScrolled = computed(() => !arrivedState.top)

watch(directions, ({ bottom, top }) => {
  if (bottom) {
    lastScrollDirection.value = 'down'
  } else if (top) {
    lastScrollDirection.value = 'up'
  }
})

const isNavigationHidden = computed(() => {
  return y.value >= 52 && lastScrollDirection.value === 'down'
})

onMounted(() => {
  nextTick(() => (isInitialized.value = true))
})
</script>

<template>
  <header
    z="$zNavigation"
    class="navigation-wrapper"
    :class="{
      'is-scrolled': isScrolled,
      'is-hidden': isNavigationHidden && !rightDrawer && !leftDrawer,
      'is-initialized': isInitialized,
    }"
  >
    <div class="navigation">
      <nav flex="~ 1 gap-x-2 gap-y-1 wrap">
        <slot name="left" />
      </nav>

      <slot name="before-actions" />

      <!-- THEME & LOCALE & ACCOUNT -->
      <div class="toolbar">
        <slot name="prepend-actions" />

        <slot name="actions">
          <ThemeToggle />
          <LocaleSwitch />
          <AccountBtn v-if="!noAccountBtn" />
        </slot>

        <slot name="append-actions" />
      </div>

      <slot name="after-actions" />
    </div>

    <div id="nav-placeholder" />
  </header>
</template>

<style lang="scss" scoped>
header {
  --apply: relative top-0 inset-inline-0 transition-transform ease-linear
    bg-dark;

  &.is-hidden {
    --apply: -translate-y-52px;
  }

  &.is-initialized {
    --apply: fixed;
  }

  &.is-scrolled:not(:has(~ main .has-breadcrumbs)) {
    --apply: shadow-consistent shadow-ca;
  }

  .toolbar {
    --apply: flex flex-gap-1.5 self-start h-$navigation items-center min-h-40px
      dark:bg-darker bg-light self-center p-x-2 rounded-full;
  }
}

.navigation {
  // Project specific
  --apply: w-full flex flex-gap-2 p-x-1 min-h-52px m-x-auto max-w-$pageWidth;

  &-wrapper {
    --apply: flex flex-col;
  }
}
</style>
