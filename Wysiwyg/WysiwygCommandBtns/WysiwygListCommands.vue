<script setup lang="ts">
// Store
import { useWysiwygStore } from '~/components/Wysiwyg/wysiwyg.store'

// Store
const { editor } = useWysiwygStore()

// Layout
const isBulletedList = computed(() => editor?.isActive('bulletList'))
const isNumberedList = computed(() => editor?.isActive('orderedList'))
const isTaskList = computed(() => editor?.isActive('taskList'))

function handleToggleBullettedList() {
  editor?.chain().focus().toggleBulletList().run()
}

function handleToggleNumberedList() {
  editor?.chain().focus().toggleOrderedList().run()
}

function handleToggleTaskList() {
  editor?.chain().focus().toggleTaskList().run()
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
