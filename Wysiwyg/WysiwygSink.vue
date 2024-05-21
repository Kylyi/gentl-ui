<script setup lang="ts">
import { editorKey } from '~/components/Wysiwyg/provide/wysiwyg.provide'

type IProps = {
  allowLink?: boolean
  textSize?: string
}

const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'set-heading', payload: { isHeading: boolean; level?: 4 | 5 | 6 }): void
  (e: 'toggle-bold'): void
  (e: 'toggle-italic'): void
  (e: 'toggle-underline'): void
  (e: 'text-align', value: string): void
  (e: 'text-color', value?: string | null): void
  (e: 'toggle-bulleted-list'): void
  (e: 'toggle-numbered-list'): void
  (e: 'insert-gallery'): void
  (e: 'toggle-task-list'): void
}>()

// Layout
const editor = inject(editorKey)

const canUseImage = computed(() => {
  return toValue(editor)?.options.extensions.find(ext => ext.name === 'mage')
})
</script>

<template>
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

      <WysiwygFileCommandBtn />
    </template>

    <template v-if="canUseImage">
      <Separator
        vertical
        spaced
        inset
      />

      <WysiwygImg />
    </template>
  </HorizontalScroller>
</template>

<style lang="scss" scoped>
.wysiwyg-sink {
  --apply: z-$zLogo dark:bg-darker bg-white;

  :deep(.btn) {
    --apply: border-1 border-transparent;
  }

  :deep(.is-active) {
    --apply: border-primary color-primary;
  }
}
</style>
