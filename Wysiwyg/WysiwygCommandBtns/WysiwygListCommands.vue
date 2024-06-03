<script setup lang="ts">
// Functions
import { useWysiwygInjections } from '~/components/Wysiwyg/functions/useWysiwygInjections'

// Utils
const { wysiwygEditor } = useWysiwygInjections()

// Layout
const isBulletedList = computed(() => toValue(wysiwygEditor)?.isActive('bulletList'))
const isNumberedList = computed(() => toValue(wysiwygEditor)?.isActive('orderedList'))

function handleToggleBullettedList() {
  toValue(wysiwygEditor)?.chain().focus().toggleBulletList().run()
}

function handleToggleNumberedList() {
  toValue(wysiwygEditor)?.chain().focus().toggleOrderedList().run()
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
