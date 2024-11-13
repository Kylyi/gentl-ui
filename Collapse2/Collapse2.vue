<script setup lang="ts">
import type { CSSProperties } from 'vue'

type IProps = {
  expandIcon?: string
  icon?: string
  loading?: boolean
  modelValue?: boolean
  noTransition?: boolean
  title?: string

  ui?: {
    containerClass?: ClassType
    containerStyle?: CSSProperties
    contentClass?: ClassType
    contentStyle?: CSSProperties
    headerClass?: ClassType
    headerStyle?: CSSProperties
  }
}

defineProps<IProps>()

// Layout
const isOpen = defineModel<boolean>({ default: false })
</script>

<template>
  <div
    class="collapse"
    :data-state="isOpen ? 'open' : 'closed'"
    :class="ui?.containerClass"
    :style="ui?.containerStyle"
    :aria-expanded="isOpen"
  >
    <!-- Header -->
    <slot name="header">
      <Item
        class="collapse__header"
        :class="ui?.headerClass"
        :style="ui?.headerStyle"
        :data-state="isOpen ? 'open' : 'closed'"
        @click="isOpen = !isOpen"
      >
        <!-- Header left -->
        <slot name="header-left">
          <div class="collapse__header-left">
            <div
              v-if="icon"
              :class="icon"
            />
          </div>
        </slot>

        <!-- Header title -->
        <slot name="header-title">
          <span
            :highlighted="false"
            class="collapse__header-title"
          >
            {{ title }}
          </span>
        </slot>

        <!-- Header right -->
        <slot
          name="header-right"
          :loading
        >
          <div class="collapse__header-right">
            <!-- Loader -->
            <LoaderBlock
              v-if="loading"
              size="xs"
            />

            <!-- Expand icon -->
            <div
              class="expand-icon i-majesticons:chevron-right"
              :class="[expandIcon, { 'rotate-90deg': isOpen }]"
            />
          </div>
        </slot>
      </Item>
    </slot>

    <!-- Content -->
    <div
      v-if="isOpen"
      class="collapse__content"
      :data-state="isOpen ? 'open' : 'closed'"
      :class="ui?.contentClass"
      :style="ui?.contentStyle"
    >
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.collapse {
  @apply flex flex-col;

  &__header {
    @apply flex items-center gap-2 p-x-2 min-h-10;
    @apply bg-$Collapse-header-bg;

    &-left {
      @apply shrink-0;
    }

    &-right {
      @apply flex gap-1 items-center shrink-0;
    }

    &-title {
      @apply grow overflow-auto font-rem-14 font-semibold;
    }

    &[data-state='open'] {
      @apply rounded-b-0;
      @apply bg-$Collapse-header-active-bg color-$Collapse-header-active-color;
    }
  }

  &__content {
    @apply flex flex-col;
  }
}
</style>
