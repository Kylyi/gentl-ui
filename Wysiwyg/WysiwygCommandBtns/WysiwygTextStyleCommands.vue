<script setup lang="ts">
// Store
import { useWysiwygStore } from '~/components/Wysiwyg/wysiwyg.store'

// Store
const { editor } = useWysiwygStore()

// Bold & Italic & Underline
const isBold = computed(() => editor?.isActive('bold'))
const isItalic = computed(() => editor?.isActive('italic'))
const isUnderline = computed(() => editor?.isActive('underline'))
const isStrikethrough = computed(() => editor?.isActive('strike'))

function handleToggleBold() {
  editor?.chain().focus().toggleBold().run()
}

function handleToggleUnderline() {
  editor?.chain().focus().toggleUnderline().run()
}

function handleToggleItalic() {
  editor?.chain().focus().toggleItalic().run()
}

function handleToggleStrikethrough() {
  editor?.chain().focus().toggleStrike().run()
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

    <!-- Strikethrough -->
    <Btn
      icon="i-material-symbols:format-strikethrough-rounded"
      size="sm"
      color="ca"
      :class="{ 'is-active': isStrikethrough }"
      @click.stop.prevent="handleToggleStrikethrough"
      @mousedown.stop.prevent
    />
  </div>
</template>
