<script setup lang="ts">
import { Editor } from '@tiptap/vue-3'

// COMPONENTS
import MenuProxy from '~/components/MenuProxy/MenuProxy.vue'

type IProps = {
  allowLink?: boolean
  editor: Editor
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

// LAYOUT
const colorMenuEl = ref<InstanceType<typeof MenuProxy>>()

const canUseImage = computedEager(() => {
  return props.editor.options.extensions.find(ext => ext.name === 'mage')
})

function handleColorChange(color?: string | null) {
  colorMenuEl.value?.hide()
  emits('text-color', color)
}
</script>

<template>
  <HorizontalScroller
    class="wysiwyg-sink"
    content-class="gap-x-1 p-1"
  >
    <WysiwygTextSizeSimpleCommands
      :editor="editor"
      @set-heading="$emit('set-heading', $event)"
    />

    <Separator
      vertical
      inset
    />

    <Btn
      size="sm"
      icon="material-symbols:format-color-text-rounded"
      @click.stop.prevent
      @mousedown.stop.prevent
    >
      <MenuProxy
        ref="colorMenuEl"
        hide-header
      >
        <ColorBrandingPicker
          @update:model-value="handleColorChange"
          @click.stop.prevent
          @mousedown.stop.prevent
        />
      </MenuProxy>
    </Btn>

    <Separator
      vertical
      inset
    />

    <WysiwygTextStyleCommands
      :editor="editor"
      @toggle-bold="$emit('toggle-bold')"
      @toggle-italic="$emit('toggle-italic')"
      @toggle-underline="$emit('toggle-underline')"
    />

    <Separator
      vertical
      spaced
      inset
    />

    <WysiwygTextAlignmentCommands
      :editor="editor"
      @text-align="$emit('text-align', $event)"
    />

    <Separator
      vertical
      spaced
      inset
    />

    <WysiwygListCommands
      :editor="editor"
      @toggle-bulleted-list="$emit('toggle-bulleted-list')"
      @toggle-numbered-list="$emit('toggle-numbered-list')"
    />

    <template v-if="allowLink">
      <Separator
        vertical
        spaced
        inset
      />

      <WysiwygLink :editor="editor" />
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
