<script setup lang="ts">
// Functions
import { useWysiwygInjections } from '~/components/Wysiwyg/functions/useWysiwygInjections'

defineEmits<{
  (e: 'set-heading', value: boolean): void
  (e: 'toggle-bold'): void
  (e: 'toggle-italic'): void
  (e: 'toggle-underline'): void
}>()

// Utils
const { wysiwygEditor } = useWysiwygInjections()

function handleSetColor(color?: string | null) {
  color
    ? toValue(wysiwygEditor)?.chain().focus().setColor(color).run()
    : toValue(wysiwygEditor)?.chain().focus().unsetColor().run()
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
