<script setup lang="ts">
import { Editor } from '@tiptap/vue-3'

type IProps = {
  editor: Editor
}

const props = defineProps<IProps>()
defineEmits<{
  (e: 'text-align', value: string): void
}>()

// TEXT ALIGNMENT
const isAlignedLeft = computed(() =>
  props.editor.isActive({ textAlign: 'left' })
)
const isAlignedCenter = computed(() =>
  props.editor.isActive({ textAlign: 'center' })
)
const isAlignedRight = computed(() =>
  props.editor.isActive({ textAlign: 'right' })
)
const isAlignedJustify = computed(() =>
  props.editor.isActive({ textAlign: 'justify' })
)
</script>

<template>
  <div flex="~">
    <Btn
      icon="i-material-symbols:format-align-left-rounded"
      size="sm"
      color="ca"
      :class="{ 'is-active': isAlignedLeft }"
      @click.stop.prevent="$emit('text-align', 'left')"
      @mousedown.stop.prevent
    />
    <Btn
      icon="i-material-symbols:format-align-center-rounded"
      size="sm"
      color="ca"
      :class="{ 'is-active': isAlignedCenter }"
      @click.stop.prevent="$emit('text-align', 'center')"
      @mousedown.stop.prevent
    />
    <Btn
      icon="i-material-symbols:format-align-right-rounded"
      size="sm"
      color="ca"
      :class="{ 'is-active': isAlignedRight }"
      @click.stop.prevent="$emit('text-align', 'right')"
      @mousedown.stop.prevent
    />
    <Btn
      icon="i-material-symbols:format-align-justify-rounded"
      size="sm"
      color="ca"
      :class="{ 'is-active': isAlignedJustify }"
      @click.stop.prevent="$emit('text-align', 'justify')"
      @mousedown.stop.prevent
    />
  </div>
</template>
