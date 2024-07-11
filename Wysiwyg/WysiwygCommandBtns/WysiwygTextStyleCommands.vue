<script setup lang="ts">
// Functions
import { useWysiwygInjections } from '~/components/Wysiwyg/functions/useWysiwygInjections'

// Utils
const { wysiwygEditor } = useWysiwygInjections()

// Bold & Italic & Underline
const isBold = computed(() => toValue(wysiwygEditor)?.isActive('bold'))
const isItalic = computed(() => toValue(wysiwygEditor)?.isActive('italic'))
const isUnderline = computed(() => toValue(wysiwygEditor)?.isActive('underline'))
const isStrikethrough = computed(() => toValue(wysiwygEditor)?.isActive('strike'))

function handleToggleBold() {
  toValue(wysiwygEditor)?.chain().focus().toggleBold().run()
}

function handleToggleUnderline() {
  toValue(wysiwygEditor)?.chain().focus().toggleUnderline().run()
}

function handleToggleItalic() {
  toValue(wysiwygEditor)?.chain().focus().toggleItalic().run()
}

function handleToggleStrikethrough() {
  toValue(wysiwygEditor)?.chain().focus().toggleStrike().run()
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
