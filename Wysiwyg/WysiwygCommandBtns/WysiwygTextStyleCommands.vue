<script setup lang="ts">
import { editorKey } from '~/components/Wysiwyg/provide/wysiwyg.provide'

// Layout
const editor = inject(editorKey)

// Bold & Italic & Underline
const isBold = computed(() => toValue(editor)?.isActive('bold'))
const isItalic = computed(() => toValue(editor)?.isActive('italic'))
const isUnderline = computed(() => toValue(editor)?.isActive('underline'))

function handleToggleBold() {
  toValue(editor)?.chain().focus().toggleBold().run()
}

function handleToggleUnderline() {
  toValue(editor)?.chain().focus().toggleUnderline().run()
}

function handleToggleItalic() {
  toValue(editor)?.chain().focus().toggleItalic().run()
}
</script>

<template>
  <div flex="~">
    <!-- Bold -->
    <Btn
      icon="i-material-symbols:format-bold-rounded"
      size="sm"
      color="ca"
      :class="{ 'is-active': isBold }"
      @click.stop.prevent="handleToggleBold"
      @mousedown.stop.prevent
    />

    <!-- Italic -->
    <Btn
      icon="i-material-symbols:format-italic-rounded !w-5 !h-5 m-b-1px"
      size="sm"
      color="ca"
      :class="{ 'is-active': isItalic }"
      @click.stop.prevent="handleToggleItalic"
      @mousedown.stop.prevent
    />

    <!-- Underline -->
    <Btn
      icon="i-material-symbols:format-underlined-rounded"
      size="sm"
      color="ca"
      :class="{ 'is-active': isUnderline }"
      @click.stop.prevent="handleToggleUnderline"
      @mousedown.stop.prevent
    />
  </div>
</template>
