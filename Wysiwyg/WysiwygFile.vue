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
    } = useWysiwygInjections()

    const { files } = useFiles()
    const { handleRequest } = useRequest()
    const uuid = props.node.attrs.uuid
    const self = getCurrentInstance()

    // New files uploaded through and grouped by the `uuid`
    const componentData = wysiwygProvidedData?.[uuid]

    const file = computed(() => {
      const uploadedFile = wysiwygFilesByPath.value?.[props.node.attrs.filepath as keyof typeof wysiwygFilesByPath.value]
      const providedFile = componentData?.file as FileModel | undefined

      return uploadedFile || providedFile
    })

    function handleRemove() {
      wysiwygRemoveElement?.(self?.vnode.el as HTMLElement)
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

    onBeforeUnmount(() => {
      if (file.value instanceof FileModel && file.value.isUploaded) {
        file.value?.delete(handleRequest)
      } else if (file.value instanceof FileModel && !file.value.isUploaded) {
        file.value?.cancelUpload?.()
      }
    })

    return {
      file,
      componentData,
      handleRemove,
    }
  },
}
</script>

<template>
  <NodeViewWrapper class="wysiwyg-file">
    <FilePreview
      v-if="file"
      :file="file"
      data-drag-handle
      :editable="!('id' in file)"
      @remove="handleRemove"
    />
  </NodeViewWrapper>
</template>

<style lang="scss" scoped>
.wysiwyg-file {
  @apply inline-block cursor-default m-r-1;
}
</style>
