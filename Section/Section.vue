<script setup lang="ts">
// TYPES
import type { ISectionProps } from '~~/components/Section/types/section-props.type'

const props = defineProps<ISectionProps>()

const slots = useSlots()
const isTitleVisible = computedEager(() => {
  return !!(props.title || props.subtitle || slots.subtitle || slots.title)
})

defineOptions({
  inheritAttrs: false,
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
    <!-- TITLE & SUBTITLE -->
    <div
      v-if="isTitleVisible"
      flex="~ col"
      w="full"
      shrink-0
    >
      <slot name="title">
        <!-- TITLE -->
        <Heading
          v-if="title"
          :class="titleClass"
          :filled="titleFilled"
          flex="col center"
        >
          <div
            flex="~ gap-x-2"
            w-full
          >
            <slot name="title-left" />

            <span grow>
              {{ title }}
            </span>

            <slot name="title-right" />
          </div>

          <!-- SUBTITLE -->
          <div
            v-if="subtitle || $slots.subtitle"
            class="section-subtitle"
            :class="subtitleClass"
          >
            <slot name="subtitle">
              {{ subtitle }}
            </slot>
          </div>
        </Heading>
      </slot>
    </div>

    <div v-bind="$attrs">
      <slot />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.section {
  --apply: flex flex-col rounded-custom;

  &--dense {
    --apply: p-x-0 p-b-0;
  }

  &-subtitle {
    --apply: italic color-true-gray-400 text-sm p-b-1 w-full;
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
</style>
