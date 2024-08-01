<script setup lang="ts">
// Types
import type { IWysiwygProps } from '~/components/Wysiwyg/types/wysiwyg-props.type'

// Store
import { useWysiwygStore } from '~/components/Wysiwyg/wysiwyg.store'

const props = defineProps<IWysiwygProps>()

// Store
const { isFocused } = storeToRefs(useWysiwygStore())

// Layout
const sinkEl = ref<HTMLDivElement>()
const hasActiveMenu = ref(false)

const isEditable = computed(() => !props.readonly && !props.disabled)

const isSinkVisible = computed(() => {
  if (props.noSink || !isEditable.value) {
    return false
  }

  return isFocused.value || props.sinkAlwaysVisible || hasActiveMenu.value
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
    @click.stop.prevent
    @mousedown.stop.prevent
  >
    <slot name="prepend" />

    <HorizontalScroller
      class="wysiwyg-sink"
      content-class="gap-x-1 p-1"
    >
      <WysiwygTextSizeSimpleCommands />

      <Separator
        vertical
        inset
      />

      <WysiwygTextColorCommands />

      <Separator
        vertical
        inset
      />

      <WysiwygTextStyleCommands />

      <Separator
        vertical
        spaced
        inset
      />

      <WysiwygTextAlignmentCommands />

      <Separator
        vertical
        spaced
        inset
      />

      <WysiwygListCommands />

      <template v-if="allowLink">
        <Separator
          vertical
          spaced
          inset
        />

        <WysiwygLink />

        <WysiwygFileCommandBtn v-if="allowFileUpload" />
      </template>

      <Separator
        vertical
        spaced
        inset
      />

      <WysiwygDetailsCommandBtn />

      <template v-if="allowImage">
        <Separator
          vertical
          spaced
          inset
        />

        <WysiwygImg />
      </template>
    </HorizontalScroller>

    <slot name="append" />
  </div>
</template>

<style lang="scss" scoped>
.wysiwyg-sink {
  @apply z-$zLogo dark:bg-darker bg-white;

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
