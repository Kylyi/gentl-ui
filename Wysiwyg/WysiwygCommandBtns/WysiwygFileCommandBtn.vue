<script setup lang="ts">
// Store
import { useWysiwygStore } from '~/components/Wysiwyg/wysiwyg.store'

// Models
import type { FileModel } from '~/components/FileInput/models/file.model'
import { useWysiwygFile } from '~/components/Wysiwyg/functions/useWysiwygFile'

// Functions
import { useNumber } from '~/components/Inputs/NumberInput/functions/useNumber'

// Store
const { filesByPath } = storeToRefs(useWysiwygStore())

// Utils
const { formatBytes } = useNumber()
const { addFiles } = useWysiwygFile()

// Layout
const selectedFiles = ref<IFile[]>([])
const files = ref<FileModel[]>([])

const uploadedFiles = computed(() => {
  if (!filesByPath.value) {
    return []
  }

  return Object.values(filesByPath.value)
})

function handleSubmit() {
  if (selectedFiles.value.length) {
    addFiles(selectedFiles.value)
  }

  if (files.value.length) {
    addFiles(files.value)
  }

  $hide()
}

function handleHide() {
  files.value = []
  selectedFiles.value = []
}
</script>

<template>
  <Btn
    icon="i-material-symbols:attachment"
    size="sm"
    color="ca"
    @click.stop.prevent
    @mousedown.stop.prevent
  >
    <Dialog
      h="auto"
      w="200"
      no-transition
      :title="$t('general.uploadFile', 2)"
      @hide="handleHide"
    >
      <Form @submit="handleSubmit">
        <Selector
          v-model="selectedFiles"
          multi
          :options="uploadedFiles"
          option-label="name"
          max-w="100"
          :label="$t('wysiwyg.useUploadedFile')"
        >
          <template #item="{ item }">
            <div
              flex="~ col"
              p="y-1"
            >
              <span>{{ item.name }}</span>
              <span text="caption">{{ formatBytes(item.size) }}</span>
            </div>
          </template>
        </Selector>

        <div class="separator">
          <div class="h-px bg-ca" />
          <span text="caption">{{ $t('queryBuilder.or') }}</span>
          <div class="h-px bg-ca" />
        </div>

        <FileInput
          v-model="files"
          multi
        />
      </Form>
    </Dialog>
  </Btn>
</template>

<style lang="scss" scoped>
.separator {
  @apply grid items-center gap-3;

  grid-template-columns: 1fr auto 1fr;
}
</style>
