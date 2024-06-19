<script lang="ts">
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'

// Functions
import { useWysiwygInjections } from '~/components/Wysiwyg/functions/useWysiwygInjections'

// Models
import { FileModel } from '~/components/FileInput/models/file.model'

export default {
  components: { NodeViewWrapper },
  props: nodeViewProps,

  setup(props) {
    // Utils
    const {
      wysiwygRemoveElement,
      wysiwygSyncFilesHTML,
      wysiwygProvidedData,
      wysiwygFilesByPath,
      wysiwygEditor,
    } = useWysiwygInjections()

    const { files } = useFiles()
    const { handleRequest } = useRequest()
    const uuid = props.node.attrs.uuid
    const filepath = props.node.attrs.filepath

    // New files uploaded through and grouped by the `uuid`
    const componentData = wysiwygProvidedData?.[uuid]

    const isEditable = computed(() => wysiwygEditor.value?.isEditable)

    const file = computed(() => {
      const uploadedFile = wysiwygFilesByPath.value?.[filepath as keyof typeof wysiwygFilesByPath.value]
      const providedFile = componentData?.file as FileModel | undefined

      return uploadedFile || providedFile
    })

    function handleRemove() {
      if (file.value instanceof FileModel && file.value.isUploaded) {
        file.value.delete(handleRequest)
      } else if (file.value instanceof FileModel && !file.value.isUploaded) {
        file.value.cancelUpload?.()
      }

      wysiwygRemoveElement?.(`span[uuid="${uuid}"]`)
    }

    // When this component is mounted (~ an image is inserted into the Wysiwyg editor, upload the files)
    onMounted(() => {
      nextTick(() => {
        if (file.value instanceof FileModel && !file.value.isUploaded) {
          file.value.upload?.(handleRequest).then(() => wysiwygSyncFilesHTML?.())
        }
      })
    })

    whenever(file, file => {
      files.value = [file]
    }, { deep: true, immediate: true })

    // onBeforeUnmount(() => {
    //   if (file.value instanceof FileModel && file.value.isUploaded) {
    //     file.value?.delete(handleRequest)
    //   } else if (file.value instanceof FileModel && !file.value.isUploaded) {
    //     file.value?.cancelUpload?.()
    //   }
    // })

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
    <FilePreview2
      v-if="file"
      :file="file"
      data-drag-handle
      w="!52"
      h="!52"
      :editable="isEditable"
      @remove="handleRemove"
    />

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
