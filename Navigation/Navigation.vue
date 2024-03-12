<script setup lang="ts">
const props = defineProps<{
  noAccountBtn?: boolean
  noToolbar?: boolean
  noShadow?: boolean

  /**
   * When true, the navigation will not hide when scrolling
   */
  noHide?: boolean
}>()

defineEmits<{
  (e: 'toggle-drawer'): void
}>()

// Constants
 */
const SCROLL_TRIGGER_PX = 80

// Injections
const rightDrawer = inject('rightDrawer', ref(false))

// Layout
const isInitialized = ref(false)
const navigationEl = ref<HTMLElement>()

// Scroll utils
const lastScrollDirection = ref<'up' | 'down'>('down')
const diff = ref(0)

const { arrivedState, y } = useScroll(() => (process.client ? window : null), {
  throttle: 10,
})

const isScrolled = computed(() => !arrivedState.top)

watch(y, (oldY, y) => {
  let newScrolLDirection: 'up' | 'down'

  if (oldY > y) {
    newScrolLDirection = 'down'
  } else {
    newScrolLDirection = 'up'
  }

  // Reset diff if direction changes
  if (lastScrollDirection.value !== newScrolLDirection) {
    diff.value = 0
  }

  diff.value += Math.abs(oldY - y)
  lastScrollDirection.value = newScrolLDirection
})

const isNavigationHidden = computed(() => {
  if (!navigationEl.value || props.noHide) {
    return false
  }

  const hasScrollerMoreThanNavigationHeight =
    y.value >= navigationEl.value.offsetHeight
  const hasScrolledDown = lastScrollDirection.value === 'down'
  const hasScrolledUpEnough = !(
    diff.value > SCROLL_TRIGGER_PX && lastScrollDirection.value === 'up'
  )

  return (
    hasScrollerMoreThanNavigationHeight &&
    (hasScrolledDown || hasScrolledUpEnough)
  )
})

onMounted(() => {
  nextTick(() => (isInitialized.value = true))
})
</script>

<template>
  <header
    z="$zNavigation"
    class="navigation-wrapper"
    :class="[
      {
        'has-shadow': isScrolled && !noShadow,
        'is-hidden': isNavigationHidden && !leftDrawer && !rightDrawer,
        'is-initialized': isInitialized,
      },
    ]"
  >
    <div
      ref="navigationEl"
      class="navigation"
    >
      <nav flex="~ 1 gap-x-2 gap-y-1 wrap">
        <slot name="left" />
      </nav>

      <slot name="before-actions" />

      <!-- Theme & Locale & Account -->
      <div
        v-if="!noToolbar"
        class="toolbar"
      >
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
  --apply: relative top-0 inset-inline-0 transition-transform ease-linear;

  &.is-hidden {
    --apply: -translate-y-100%;
  }

  &.is-initialized {
    --apply: fixed;
  }

  &.has-shadow:not(:has(~ main .has-breadcrumbs)) {
    --apply: shadow-consistent shadow-ca;
  }

  .toolbar {
    --apply: flex flex-gap-1.5 self-start h-$navigation items-center min-h-40px
      bg-white dark:bg-darker self-center p-x-2 rounded-full;

    .environment {
      --apply: absolute left-50% -translate-x-1/2 p-y-1 p-x-2 color-white rounded-custom
        border-2 border-white;
    }
  }
}

.navigation {
  --apply: w-full flex flex-gap-2 p-x-1;

  &-wrapper {
    --apply: flex flex-col justify-center bg-$Navigation-bg min-h-$navHeight;
  }
}
</style>
