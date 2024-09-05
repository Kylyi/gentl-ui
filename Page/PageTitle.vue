<script setup lang="ts">
// Types
import type { IPageTitleProps } from '~/components/Page/types/page-title-props.type'

const props = defineProps<IPageTitleProps>()
const slots = useSlots()

const hasContent = computed(() => {
  return (
    props.title
    || !!slots.default
    || !!slots['title-left']
    || !!slots['title-right']
    || !!slots['title-below']
    || !!slots['title-prepend']
    || !!slots['title-append']
  )
})

const title = computed(() => {
  if (!props.title) {
    return
  }

  if (typeof props.title === 'string') {
    return props.title
  } else {
    return props.title.value
  }
})

const previousValueTitle = computed(() => {
  if (!props.title || typeof props.title === 'string') {
    return
  }

  return props.title.previousValue
})
</script>

<template>
  <div
    v-if="hasContent"
    class="page-title__wrapper"
    :class="{ 'has-shadow': ui?.titleWithShadow }"
  >
    <div class="page-title">
      <slot name="title-left" />

      <h4 class="page-title__text">
        <slot name="title-prepend" />

        <slot>
          {{ title }}
        </slot>

        <span
          v-if="previousValueTitle"
          color="purple-500 dark:purple-600"
        >
          <br>
          {{ previousValueTitle }}
        </span>

        <slot name="title-append" />
      </h4>

      <slot name="title-right" />
    </div>

    <slot name="title-below" />
  </div>
</template>

<style lang="scss" scoped>
.page-title {
  @apply flex gap-2;

  &__wrapper {
    @apply flex flex-col gap-6;
    @apply max-w-$PageTitle-max-width p-$PageTitle-padding m-$PageTitle-margin;

    &.has-shadow {
      box-shadow: 0 8px 8px -9px theme('colors.truegray.300');
    }
  }

  &__text {
    @apply grow font-$PageTitle-font-weight m-b-0;
  }
}

.dark .page-title__wrapper {
  &.has-shadow {
    box-shadow: 0 8px 8px -9px theme('colors.truegray.700');
  }
}
</style>
