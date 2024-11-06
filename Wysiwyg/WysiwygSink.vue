<script setup lang="ts">
// Types
import type { IWysiwygProps } from '~/components/Wysiwyg/types/wysiwyg-props.type'

// Store
import { useWysiwygStore } from '~/components/Wysiwyg/wysiwyg.store'

type IProps = Pick<IWysiwygProps, 'features' | 'sink'> & {
  editable?: boolean
}

const props = defineProps<IProps>()

// Store
const { isFocused, features, sink } = storeToRefs(useWysiwygStore())
console.log('Log ~ features:', features.value)

// Layout
const sinkEl = ref<HTMLDivElement>()
const hasActiveMenu = ref(false)

const isSinkVisible = computed(() => {
  if (!sink.value?.enabled || !props.editable) {
    return false
  }

  return isFocused.value || sink.value?.alwaysVisible || hasActiveMenu.value
})

useMutationObserver(
  sinkEl,
  records => {
    hasActiveMenu.value = records.some(record => {
      const targetClasslist = (record.target as HTMLElement).classList

      return targetClasslist.contains('is-menu-active') || targetClasslist.contains('is-dialog-active')
    })
  },
  { subtree: true, attributeFilter: ['class'] },
)
</script>

<template>
  <div
    v-if="isSinkVisible"
    ref="sinkEl"
    class="wysiwyg-sink__wrapper"
    :class="{ 'is-floating': sink?.floating }"
    @click.stop.prevent
    @mousedown.stop.prevent
  >
    <slot name="prepend" />

    <HorizontalScroller
      class="wysiwyg-sink"
      content-class="gap-x-1 p-px"
    >
      <!-- Size -->
      <WysiwygTextSizeSimpleCommands />

      <Separator
        vertical
        inset
      />

      <!-- Text Color -->
      <WysiwygTextColorCommands />

      <Separator
        vertical
        inset
      />

      <!-- Text style -->
      <WysiwygTextStyleCommands />

      <Separator
        vertical
        spaced
        inset
      />

      <!-- Text alignment -->
      <WysiwygTextAlignmentCommands />

      <Separator
        vertical
        spaced
        inset
      />

      <!-- List (ordered & unordered) -->
      <WysiwygListCommands />

      <!-- Link & File -->
      <template v-if="features?.link || features?.fileUpload">
        <Separator
          vertical
          spaced
          inset
        />

        <WysiwygLink v-if="features?.link" />

        <WysiwygFileCommandBtn v-if="features?.fileUpload" />
      </template>

      <Separator
        vertical
        spaced
        inset
      />

      <!-- Details -->
      <WysiwygDetailsCommandBtn />

      <!-- Email button -->
      <template v-if="features?.emailButton">
        <Separator
          vertical
          spaced
          inset
        />

        <WysiwygEmailBtnCommand />
      </template>

      <!-- Image -->
      <template v-if="features?.image">
        <Separator
          vertical
          spaced
          inset
        />

        <WysiwygImgCommand />
      </template>

      <!-- Table -->
      <template v-if="features?.table">
        <Separator
          vertical
          spaced
          inset
        />

        <WysiwygTableCommandBtn />
      </template>
    </HorizontalScroller>

    <slot name="append" />
  </div>
</template>

<style lang="scss" scoped>
.wysiwyg-sink {
  @apply z-$zLogo dark:bg-darker bg-white border-x-1 border-b-1 border-ca rounded-b-custom;

  &__wrapper {
    @apply flex gap-2 items-center right-0 w-full shrink-0;

    &.is-floating {
      @apply absolute -top-40px;
    }
  }

  :deep(.btn) {
    @apply border-1 border-transparent;
  }

  :deep(.is-active) {
    @apply border-primary color-primary;
  }
}
</style>
