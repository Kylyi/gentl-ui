<script setup lang="ts">
// Models
import type { FileModel } from '~/components/FileInput/models/file.model'

// Store
import { useWysiwygStore } from '~/components/Wysiwyg/wysiwyg.store'

// Store
const { editor } = useWysiwygStore()

// Layout
const files = ref<FileModel[]>([])

async function handleAddImage() {
  if (!files.value.length) {
    return
  }

  // Get image data URL
  const file = files.value[0].file
  const reader = new FileReader()

  reader.onload = e => {
    const dataUrl = e.target?.result

    editor
      ?.chain()
      .focus()
      .insertContent(`<img
        src="${dataUrl}"
        alt="${files.value[0].name}"
        width="200"
        height="200"
        style="width:200px;height:200px;object-fit:cover;border-radius:4px;float:left;"
      />`)
      .run()

    $hide()
  }

  reader.readAsDataURL(file)
}
</script>

<template>
  <div flex="~">
    <Btn
      icon="i-ion:image-outline"
      size="sm"
      color="ca"
      @mousedown.stop.prevent
    >
      <Dialog :title="$t('wysiwyg.addImage')">
        <Form
          :submit-disabled="!files.length"
          @submit="handleAddImage"
        >
          <FileInput
            v-model="files"
            accept="image/*"
          />
        </Form>
      </Dialog>
    </Btn>
  </div>
</template>
