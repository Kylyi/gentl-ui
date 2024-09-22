<script setup lang="ts">
import { config } from '~/components/config/components-config'

// Types
import type { ISectionProps } from '~/components/Section/types/section-props.type'

// Functions
import { useHeadingUtils } from '~/components/Typography/functions/useHeadingUtils'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ISectionProps>(), {
  filled: config.section.props?.filled ?? false,
  highlighted: config.section.props?.highlighted ?? true,
})

const slots = useSlots()

// Utils
const { getHeadingProps } = useHeadingUtils()

// Layout
const headingProps = getHeadingProps(props)

const isTitleVisible = computed(() => {
  return !!(props.title || props.subtitle || slots.subtitle || slots.title)
})
</script>

<template>
  <section
    class="section"
    p="y-2 x-4"
    :class="[
      sectionClass,
      {
        'section--bordered': bordered,
        'section--dense': dense,
      },
    ]"
  >
    <!-- Title & Subtitle -->
    <div
      v-if="isTitleVisible"
      flex="~ col"
      w="full"
      shrink-0
    >
      <slot name="title">
        <!-- Title -->
        <Heading
          v-if="title"
          :class="[
            headerClass,
            { 'p-t-1': subtitle || $slots.subtitle },
            { 'is-highlighted': highlighted },
          ]"
          v-bind="headingProps"
          flex="col center"
        >
          <div
            flex="~ gap-x-2"
            w-full
            items-center
            :class="titleClass"
          >
            <slot name="title-left" />

            <span grow>
              {{ title }}
            </span>

            <slot name="title-right" />
          </div>

          <!-- Subtitle -->
          <div
            v-if="subtitle || $slots.subtitle"
            class="section-subtitle"
            text="subtitle"
            :class="subtitleClass"
          >
            <slot name="subtitle">
              {{ subtitle }}
            </slot>
          </div>
        </Heading>
      </slot>
    </div>

    <div
      p="t-2"
      gap="$Section-content-gap"
      v-bind="$attrs"
    >
      <slot />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.section {
  --apply: relative flex flex-col rounded-custom max-w-$Section-max-w;

  &--dense {
    --apply: p-x-0 p-b-0;
  }

  &-subtitle {
    --apply: w-full p-b-2;
  }

  &--bordered {
    --apply: border-2 border-ca lt-sm:p-x-2;
  }
}

.form--dense {
  .section {
    --apply: p-x-0;
  }
}

.heading:not(.is-filled) {
  .section-subtitle {
    --apply: p-b-3;
  }
}

.heading.is-filled.is-highlighted  {
  &::before {
    --apply: absolute content-empty top-0 left-0 w-1 h-full bg-primary;
  }
}
</style>
