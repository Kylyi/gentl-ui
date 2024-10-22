<script setup lang="ts">
// Store
import { useWysiwygStore } from '~/components/Wysiwyg/wysiwyg.store'

// Utils
const { getColor } = useColors()

// Store
const { editor } = useWysiwygStore()

function handleAddBtn() {
  const primaryColor = getColor('primary', 1, true)

  editor
    ?.chain()
    .focus()
    .insertContent(`<a
    href="#"
    data-type="wysiwyg-email-btn"
    content="Link"
    data-id="${generateUUID()}"
    style="padding-left:8px;padding-right:8px;border-radius:4px;background-color:${primaryColor};color:#FFFFFF;"
    ></a>`)
    .run()
}
</script>

<template>
  <div flex="~">
    <Btn
      icon="i-formkit:button"
      size="sm"
      color="ca"
      @mousedown.stop.prevent
      @click="handleAddBtn"
    />
  </div>
</template>
