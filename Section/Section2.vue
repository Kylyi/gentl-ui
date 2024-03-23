<script setup lang="ts">
import { config } from '~/components/config/components-config'

// Types
import type { ISectionProps } from '~/components/Section/types/section-props.type'

defineOptions({
  inheritAttrs: false,
})

withDefaults(defineProps<ISectionProps>(), {
  titleElement: 'h6',
  ui: () => config.section2.props.ui ?? {},
})
</script>

<template>
  <section
    class="section"
    :class="ui?.sectionClass"
    :style="ui?.sectionStyle"
  >
    <!-- Title -->
    <slot
      v-if="$slots.title || title"
      name="title"
    >
      <Component
        :is="titleElement"
        class="section__title"
        :class="ui?.titleClass"
        :style="ui?.titleStyle"
      >
        {{ title }}
      </Component>
    </slot>

    <!-- Subtitle -->
    <slot
      v-if="$slots.subtitle || subtitle"
      name="subtitle"
    >
      <p
        class="section__subtitle"
        :class="ui?.subtitleClass"
        :style="ui?.subtitleStyle"
      >
        {{ subtitle }}
      </p>
    </slot>

    <!-- Content -->
    <div
      class="section__content"
      v-bind="$attrs"
    >
      <slot />
    </div>
  </section>
</template>

<style scoped lang="scss">
.section {
  // Theme
  --apply: max-w-$Section-max-w p-$Section-padding;

  --apply: flex flex-col;

  &__title {
    --apply: font-bold m-b-0 p-b-1;
  }

  &__subtitle {
    --apply: font-rem-14 font-400;
  }

  &__content {
    --apply: gap-$Section-content-gap p-t-3;
  }
}
</style>
