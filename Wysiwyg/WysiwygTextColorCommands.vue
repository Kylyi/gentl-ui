<script setup lang="ts">
// Store
import { useWysiwygStore } from '~/components/Wysiwyg/wysiwyg.store'

defineEmits<{
  (e: 'set-heading', value: boolean): void
  (e: 'toggle-bold'): void
  (e: 'toggle-italic'): void
  (e: 'toggle-underline'): void
}>()

// Utils
const { editor } = useWysiwygStore()

function handleSetColor(color?: string | null) {
  color
    ? editor?.chain().focus().setColor(color).run()
    : editor?.chain().focus().unsetColor().run()
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
      <MenuProxy>
        <ColorBrandingPicker
          @update:model-value="handleSetColor"
          @click.stop.prevent
          @mousedown.stop.prevent
        />
      </MenuProxy>
    </Btn>
  </div>
</template>
