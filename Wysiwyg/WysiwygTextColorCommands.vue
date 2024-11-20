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

const currentTextColor = computed(() => {
  return editor?.getAttributes('textStyle')?.color
})

function handleSetColor(color?: string | null) {
  if (color) {
    editor?.chain().focus().setColor(color).run()
  } else {
    editor?.chain().focus().unsetColor().run()
  }
}

function handleSetBackgroundColor(color?: string | null) {
  // if (color) {
  //   editor?.chain().focus().setBackgroundColor(color).run()
  // } else {
  //   editor?.chain().focus().unsetBackgroundColor().run()
  // }
}
</script>

<template>
  <div flex="~">
    <!-- Text color -->
    <Btn
      size="sm"
      icon="i-material-symbols:format-color-text-rounded"
      :style="{ color: currentTextColor }"
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

    <!-- Background color -->
    <!-- <Btn
      size="sm"
      icon="i-material-symbols:format-color-fill"
      @click.stop.prevent
      @mousedown.stop.prevent
    >
      <MenuProxy>
        <ColorBrandingPicker
          @update:model-value="handleSetBackgroundColor"
          @click.stop.prevent
          @mousedown.stop.prevent
        />
      </MenuProxy>
    </Btn> -->
  </div>
</template>
