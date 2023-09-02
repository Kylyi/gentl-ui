<script setup lang="ts">
import { Editor } from '@tiptap/vue-3'

type IProps = {
  editor: Editor
}

const props = defineProps<IProps>()

defineEmits<{
  (e: 'toggle-bulleted-list'): void
  (e: 'toggle-numbered-list'): void
}>()

// List
const isBulletedList = computed(() => props.editor.isActive('bulletList'))
const isNumberedList = computed(() => props.editor.isActive('orderedList'))
</script>

<template>
  <div flex="~">
    <Btn
      icon="material-symbols:format-list-bulleted-rounded"
      size="sm"
      color="ca"
      :class="{ 'is-active': isBulletedList }"
      @click.stop.prevent="$emit('toggle-bulleted-list')"
      @mousedown.stop.prevent
    />
    <Btn
      icon="material-symbols:format-list-numbered-rounded"
      size="sm"
      color="ca"
      :class="{ 'is-active': isNumberedList }"
      @click.stop.prevent="$emit('toggle-numbered-list')"
      @mousedown.stop.prevent
    />
  </div>
</template>
