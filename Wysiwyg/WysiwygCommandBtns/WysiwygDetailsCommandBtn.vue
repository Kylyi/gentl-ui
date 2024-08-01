<script setup lang="ts">
// Store
import { useWysiwygStore } from '~/components/Wysiwyg/wysiwyg.store'

// Store
const { editor } = useWysiwygStore()

function handleSetDetails() {
  editor?.chain().focus().setDetails().run()
}

function handleUnsetDetails() {
  editor?.chain().focus().unsetDetails().run()
}
</script>

<template>
  <div flex="~">
    <!-- Set details -->
    <Btn
      icon="i-pajamas:details-block"
      size="sm"
      color="ca"
      :disabled="!editor?.can().setDetails()"
      @click.stop.prevent="handleSetDetails"
      @mousedown.stop.prevent
    />

    <!-- Unset details -->
    <Btn
      icon="i-gg:details-more"
      size="sm"
      color="ca"
      :disabled="!editor?.can().unsetDetails()"
      @click.stop.prevent="handleUnsetDetails"
      @mousedown.stop.prevent
    />
  </div>
</template>
