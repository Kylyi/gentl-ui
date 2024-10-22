<script lang="ts">
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'

// Models
import { FileModel } from '~/components/FileInput/models/file.model'

// Injections
import { wysiwygModelKey } from '~/components/Wysiwyg/provide/wysiwyg.provide'

// Functions
import { useWysiwygUtils } from '~/components/Wysiwyg/functions/useWysiwygUtils'

// Store
import { useWysiwygStore } from '~/components/Wysiwyg/wysiwyg.store'

export default {
  components: { NodeViewWrapper },
  props: nodeViewProps,

  setup(props) {
    // Utils
    const { removeElement } = useWysiwygUtils()
    const wysiwygStore = useWysiwygStore()
    const { editor, filesByPath } = storeToRefs(wysiwygStore)

    // Layout
    const model = injectStrict(wysiwygModelKey)
    const { files } = useFiles()
    const { handleRequest } = useRequest()
    const uuid = props.node.attrs.uuid
    const filepath = props.node.attrs.filepath

    // New files uploaded through and grouped by the `uuid`
    const componentData = computed(() => wysiwygStore.providedData[uuid])

    const isEditable = computed(() => editor.value?.isEditable)

    const file = computed(() => {
      const _filePath = filepath as keyof typeof filesByPath.value
      const uploadedFile = filesByPath.value[_filePath]
      const providedFile = componentData.value?.file as FileModel | IFile | undefined

      return uploadedFile || providedFile
    })

    function handleRemove() {
      if (file.value instanceof FileModel && file.value.isUploaded) {
        file.value.delete(handleRequest)
      } else if (file.value instanceof FileModel && !file.value.isUploaded) {
        file.value.cancelUpload?.()
      }

      removeElement?.(`span[uuid="${uuid}"]`, model)
    }

    /**
     * Once files are uploaded, its path needs to be updated in the editor,
     * this method does exactly that
     */
    function syncFilesHTML() {
      if (!editor.value) {
        return ''
      }

      const parser = new DOMParser()
      const doc = parser.parseFromString(editor.value?.getHTML(), 'text/html')

      const fileNodes = doc.querySelectorAll('[data-type="wysiwyg-file"]')

      Array.from(fileNodes).forEach(node => {
        const nodeUUID = node.getAttribute('uuid') ?? ''

        const file = wysiwygStore.providedData[nodeUUID]?.file as FileModel
        const filepath = file?.uploadedFile?.filepath

        if (filepath) {
          node.setAttribute('filepath', filepath)
        }
      })

      editor.value?.chain().setContent(doc.body.innerHTML).run()

      nextTick(() => {
        const editorValue = wysiwygStore.getEditorValue?.()
        model.value = editorValue
        editor.value?.chain().setContent(editorValue).run()
      })
    }

    // When this component is mounted (~ an image is inserted into the Wysiwyg editor, upload the files)
    onMounted(() => {
      nextTick(() => {
        if (file.value instanceof FileModel && !file.value.isUploaded) {
          file.value.upload?.(handleRequest).then(() => syncFilesHTML?.())
        }
      })
    })

    whenever(file, file => {
      files.value = [file]
    }, { deep: true, immediate: true })

    return {
      isEditable,
      uuid,
      filepath,
      file,
      componentData,
      handleRemove,
    }
  },
}
</script>

<template>
  <NodeViewWrapper class="wysiwyg-file">
    <!-- File preview -->
    <FilePreview2
      v-if="file"
      :file
      data-drag-handle
      :editable="isEditable"
      @remove="handleRemove"
    />

    <!-- Removed file -->
    <div
      v-else
      data-drag-handle
      class="file-removed"
    >
      <span
        text="xs"
        color="negative"
      >
        [{{ $t('file.deleted') }}]
      </span>

      <span
        text="caption"
        line-clamp="3"
      >
        {{ filepath.split('/').at(-1) }}
      </span>
    </div>
  </NodeViewWrapper>
</template>

<style lang="scss" scoped>
.wysiwyg-file {
  @apply inline-block cursor-default m-r-1;

  .file-removed {
    @apply flex flex-col flex-wrap gap-1 max-w-52 p-2 border-1 border-ca border-dotted rounded-custom break-anywhere;
  }
}
</style>
