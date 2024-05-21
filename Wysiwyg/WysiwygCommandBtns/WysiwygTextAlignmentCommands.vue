<script setup lang="ts">
// Injections
import { editorKey } from '~/components/Wysiwyg/provide/wysiwyg.provide'

// Layout
const editor = inject(editorKey)

const textAlignment = computed(() => {
  return {
    left: toValue(editor)?.isActive({ textAlign: 'left' }),
    center: toValue(editor)?.isActive({ textAlign: 'center' }),
    right: toValue(editor)?.isActive({ textAlign: 'right' }),
    justify: toValue(editor)?.isActive({ textAlign: 'justify' }),
  }
})

function handleTextAlign(align: string) {
  toValue(editor)?.chain().focus().setTextAlign(align).run()
}
</script>

<template>
  <div flex="~">
    <!-- Left -->
    <Btn
      icon="i-material-symbols:format-align-left-rounded"
      size="sm"
      color="ca"
      :class="{ 'is-active': textAlignment.left }"
      @click.stop.prevent="handleTextAlign('left')"
      @mousedown.stop.prevent
    />

    <!-- Center -->
    <Btn
      icon="i-material-symbols:format-align-center-rounded"
      size="sm"
      color="ca"
      :class="{ 'is-active': textAlignment.center }"
      @click.stop.prevent="handleTextAlign('center')"
      @mousedown.stop.prevent
    />

    <!-- Right -->
    <Btn
      icon="i-material-symbols:format-align-right-rounded"
      size="sm"
      color="ca"
      :class="{ 'is-active': textAlignment.right }"
      @click.stop.prevent="handleTextAlign('right')"
      @mousedown.stop.prevent
    />

    <!-- Justify -->
    <Btn
      icon="i-material-symbols:format-align-justify-rounded"
      size="sm"
      color="ca"
      :class="{ 'is-active': textAlignment.justify }"
      @click.stop.prevent="handleTextAlign('justify')"
      @mousedown.stop.prevent
    />
  </div>
</template>
