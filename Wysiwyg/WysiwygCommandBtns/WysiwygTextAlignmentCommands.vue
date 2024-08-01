<script setup lang="ts">
// Store
import { useWysiwygStore } from '~/components/Wysiwyg/wysiwyg.store'

// Store
const { editor } = useWysiwygStore()

const textAlignment = computed(() => {
  return {
    left: editor?.isActive({ textAlign: 'left' }),
    center: editor?.isActive({ textAlign: 'center' }),
    right: editor?.isActive({ textAlign: 'right' }),
    justify: editor?.isActive({ textAlign: 'justify' }),
  }
})

function handleTextAlign(align: string) {
  editor?.chain().focus().setTextAlign(align).run()
}
</script>

<template>
  <div flex="~">
    <!-- Left -->
    <Btn
      icon="i-material-symbols:format-align-left-rounded"
      size="sm"
      color="ca"
      :class="{ 'is-active': textAlignment.left }"
      @click.stop.prevent="handleTextAlign('left')"
      @mousedown.stop.prevent
    />

    <!-- Center -->
    <Btn
      icon="i-material-symbols:format-align-center-rounded"
      size="sm"
      color="ca"
      :class="{ 'is-active': textAlignment.center }"
      @click.stop.prevent="handleTextAlign('center')"
      @mousedown.stop.prevent
    />

    <!-- Right -->
    <Btn
      icon="i-material-symbols:format-align-right-rounded"
      size="sm"
      color="ca"
      :class="{ 'is-active': textAlignment.right }"
      @click.stop.prevent="handleTextAlign('right')"
      @mousedown.stop.prevent
    />

    <!-- Justify -->
    <Btn
      icon="i-material-symbols:format-align-justify-rounded"
      size="sm"
      color="ca"
      :class="{ 'is-active': textAlignment.justify }"
      @click.stop.prevent="handleTextAlign('justify')"
      @mousedown.stop.prevent
    />
  </div>
</template>
