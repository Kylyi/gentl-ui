<script setup lang="ts">
// Functions
import { useWysiwygInjections } from '~/components/Wysiwyg/functions/useWysiwygInjections'

type IProps = {
  allowLink?: boolean
  textSize?: string
  fileUpload?: boolean
}

defineProps<IProps>()

// Utils
const { wysiwygEditor } = useWysiwygInjections()

const canUseImage = computed(() => {
  return toValue(wysiwygEditor)?.options.extensions.find(ext => ext.name === 'mage')
})
</script>

<template>
  <div
    flex="~ gap-2 items-center"
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

        <WysiwygFileCommandBtn v-if="fileUpload" />
      </template>

      <Separator
        vertical
        spaced
        inset
      />

      <WysiwygDetailsCommandBtn />

      <template v-if="canUseImage">
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

  :deep(.btn) {
    @apply border-1 border-transparent;
  }

  :deep(.is-active) {
    @apply border-primary color-primary;
  }
}
</style>
