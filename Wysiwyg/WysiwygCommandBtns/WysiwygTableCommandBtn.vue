<script setup lang="ts">
// Store
import { useWysiwygStore } from '~/components/Wysiwyg/wysiwyg.store'

// Store
const { editor } = useWysiwygStore()

async function handleAddTable() {
  editor
    ?.chain()
    .focus()
    .insertTable({ rows: 3, cols: 3 })
    .run()
}
</script>

<template>
  <div flex="~">
    <Btn
      icon="i-bi:table"
      size="sm"
      color="ca"
      @click="handleAddTable"
    />
  </div>
</template>
