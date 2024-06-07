<script setup lang="ts">
// Functions
import { useWysiwygInjections } from '~/components/Wysiwyg/functions/useWysiwygInjections'

// Utils
const { wysiwygEditor } = useWysiwygInjections()

function handleSetDetails() {
  toValue(wysiwygEditor)?.chain().focus().setDetails().run()
}

function handleUnsetDetails() {
  toValue(wysiwygEditor)?.chain().focus().unsetDetails().run()
}
</script>

<template>
  <div flex="~">
    <!-- Set details -->
    <Btn
      icon="i-pajamas:details-block"
      size="sm"
      color="ca"
      :disabled="!wysiwygEditor?.can().setDetails()"
      @click.stop.prevent="handleSetDetails"
      @mousedown.stop.prevent
    />

    <!-- Unset details -->
    <Btn
      icon="i-gg:details-more"
      size="sm"
      color="ca"
      :disabled="!wysiwygEditor?.can().unsetDetails()"
      @click.stop.prevent="handleUnsetDetails"
      @mousedown.stop.prevent
    />
  </div>
</template>
