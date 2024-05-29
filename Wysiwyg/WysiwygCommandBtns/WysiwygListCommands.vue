<script setup lang="ts">
// Injections
import { editorKey } from '~/components/Wysiwyg/provide/wysiwyg.provide'

// Layout
const editor = inject(editorKey)

const isBulletedList = computed(() => toValue(editor)?.isActive('bulletList'))
const isNumberedList = computed(() => toValue(editor)?.isActive('orderedList'))

function handleToggleBullettedList() {
  toValue(editor)?.chain().focus().toggleBulletList().run()
}

function handleToggleNumberedList() {
  toValue(editor)?.chain().focus().toggleOrderedList().run()
}
</script>

<template>
  <div flex="~">
    <!-- Bullet list -->
    <Btn
      icon="i-material-symbols:format-list-bulleted-rounded"
      size="sm"
      color="ca"
      :class="{ 'is-active': isBulletedList }"
      @click.stop.prevent="handleToggleBullettedList"
      @mousedown.stop.prevent
    />

    <!-- Numbered list -->
    <Btn
      icon="i-material-symbols:format-list-numbered-rounded"
      size="sm"
      color="ca"
      :class="{ 'is-active': isNumberedList }"
      @click.stop.prevent="handleToggleNumberedList"
      @mousedown.stop.prevent
    />
  </div>
</template>
