<script setup lang="ts">
// Injections
import { editorKey } from '~/components/Wysiwyg/provide/wysiwyg.provide'

// Layout
const editor = inject(editorKey)
</script>

<template>
  <Btn
    icon="i-material-symbols:attachment"
    size="sm"
    color="ca"
    @click.stop.prevent
    @mousedown.stop.prevent
  />
</template>
