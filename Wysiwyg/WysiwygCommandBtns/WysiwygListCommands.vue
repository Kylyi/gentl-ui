<script setup lang="ts">
// Functions
import { useWysiwygInjections } from '~/components/Wysiwyg/functions/useWysiwygInjections'

// Utils
const { wysiwygEditor } = useWysiwygInjections()

// Layout
const isBulletedList = computed(() => toValue(wysiwygEditor)?.isActive('bulletList'))
const isNumberedList = computed(() => toValue(wysiwygEditor)?.isActive('orderedList'))
const isTaskList = computed(() => toValue(wysiwygEditor)?.isActive('taskList'))

function handleToggleBullettedList() {
  toValue(wysiwygEditor)?.chain().focus().toggleBulletList().run()
}

function handleToggleNumberedList() {
  toValue(wysiwygEditor)?.chain().focus().toggleOrderedList().run()
}

function handleToggleTaskList() {
  toValue(wysiwygEditor)?.chain().focus().toggleTaskList().run()
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

    <!-- Task list -->
    <Btn
      icon="i-tabler:checkbox"
      size="sm"
      color="ca"
      :class="{ 'is-active': isTaskList }"
      @click.stop.prevent="handleToggleTaskList"
      @mousedown.stop.prevent
    />
  </div>
</template>
