<script setup lang="ts">
import { Editor } from '@tiptap/vue-3'

type IProps = {
  editor: Editor
}

const props = defineProps<IProps>()
defineEmits<{
  (e: 'set-heading', value: boolean): void
  (e: 'toggle-bold'): void
  (e: 'toggle-italic'): void
  (e: 'toggle-underline'): void
}>()

// BOLD & ITALIC & UNDERLINE
const isBold = computed(() => props.editor.isActive('bold'))
const isItalic = computed(() => props.editor.isActive('italic'))
const isUnderline = computed(() => props.editor.isActive('underline'))
</script>

<template>
  <div flex="~">
    <Btn
      icon="i-material-symbols:format-bold-rounded"
      size="sm"
      color="ca"
      :class="{ 'is-active': isBold }"
      @click.stop.prevent="$emit('toggle-bold')"
      @mousedown.stop.prevent
    />
    <Btn
      icon="i-material-symbols:format-italic-rounded !w-5 !h-5 m-b-1px"
      size="sm"
      color="ca"
      :class="{ 'is-active': isItalic }"
      @click="$emit('toggle-italic')"
      @mousedown.stop.prevent
    />
    <Btn
      icon="i-material-symbols:format-underlined-rounded"
      size="sm"
      color="ca"
      :class="{ 'is-active': isUnderline }"
      @click="$emit('toggle-underline')"
      @mousedown.stop.prevent
    />
  </div>
</template>
