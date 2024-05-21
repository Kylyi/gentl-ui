<script setup lang="ts">
import { editorKey } from '~/components/Wysiwyg/provide/wysiwyg.provide';

defineEmits<{
  (e: 'set-heading', value: boolean): void
  (e: 'toggle-bold'): void
  (e: 'toggle-italic'): void
  (e: 'toggle-underline'): void
}>()

// Layout
const editor = inject(editorKey)

function handleSetColor(color?: string | null) {
  color
    ? toValue(editor)?.chain().focus().setColor(color).run()
    : toValue(editor)?.chain().focus().unsetColor().run()
}
</script>

<template>
  <div flex="~">
    <Btn
      size="sm"
      icon="i-material-symbols:format-color-text-rounded"
      @click.stop.prevent
      @mousedown.stop.prevent
    >
      <MenuProxy ref="colorMenuEl">
        <ColorBrandingPicker
          @update:model-value="handleSetColor"
          @click.stop.prevent
          @mousedown.stop.prevent
        />
      </MenuProxy>
    </Btn>
  </div>
</template>
