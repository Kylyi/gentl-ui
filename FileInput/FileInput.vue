<script setup lang="ts">
// Types
import type { IFileInputProps } from '~/components/FileInput/types/file-input-props.type'

// Models
import { FileModel } from '~/components/FileInput/models/file.model'

// Functions
import { useFieldUtils } from '~/components/Field/functions/useFieldUtils'
import { getComponentProps } from '~/components/__helpers/get-config-props'

const props = withDefaults(defineProps<IFileInputProps>(), {
  ...getComponentProps('fileInput'),
})

const emits = defineEmits<{
  (e: 'update:modelValue', value: Array<FileModel | IFile>): void
  (e: 'filesAdded', value: Array<FileModel | IFile>): void
  (e: 'filesRemoved', value: Array<FileModel | IFile>): void
  (e: 'focus'): void
  (e: 'blur'): void
}>()

// Utils
const { getFieldProps } = useFieldUtils()
const { files } = useFiles()

// Layout
const fileInputWrapperEl = ref<HTMLDivElement>()
const model = defineModel<Array<FileModel | IFile>>({
  default: [],
})
const fieldProps = getFieldProps(props)

const wrapperClass = computed(() => {
  return {
    'is-dragger-over': isOverDropZone.value,
    'is-disabled': props.disabled,
    'is-readonly': props.readonly,
    'grid gap-2 min-h-fit': props.multi,
  }
})

// File handling
const { isOverDropZone } = useDropZone(fileInputWrapperEl, {
  onDrop: handleAdd,
  dataTypes: props.accept?.split(',').map(type => type.trim()),
})

const { open, onChange, reset } = useFileDialog({
  accept: props.accept,
  multiple: props.multi,
})

function handleOpen() {
  if (!props.readonly && !props.disabled) {
    open()
  }
}

function handleAdd(files: FileList | File[] | null) {
  if (!files) {
    return
  }

  const filesArray = Array.from(files).map(file => new FileModel({ file }))

  if (props.multi) {
    model.value = [...(model.value || []), ...filesArray]
  } else {
    model.value = filesArray
  }

  emits('filesAdded', filesArray)

  reset()
}

function handleRemove(idx: number) {
  if (!model.value) {
    return
  }

  emits('filesRemoved', [model.value[idx]])
  model.value = model.value.toSpliced(idx, 1)
}

onChange(handleAdd)
syncRef(model, files, { direction: 'both', deep: true })
</script>

<template>
  <Field
    v-bind="fieldProps"
    :no-content="!model?.length"
    no-border
    control-class="!p-0"
    stack-label
    class="file-input"
  >
    <div
      ref="fileInputWrapperEl"
      class="file-input-wrapper"
      :class="wrapperClass"
      @click.stop.prevent="handleOpen"
    >
      <FilePreview
        v-for="(file, idx) in model"
        :key="idx"
        :file
        :editable="!readonly && !disabled"
        :no-download-button
        :download-url
        :no-preview
        @remove="handleRemove(idx)"
        @click.stop.prevent
      />

      <!-- Add file(s) -->
      <Btn
        v-if="model.length && !readonly && !disabled && multi"
        class="file-add"
        icon="i-eva:plus-fill h-8 w-8"
        size="auto"
        stacked
        color="primary"
        :label="$t('file.add', multi ? 2 : 1)"
      />

      <div
        v-else-if="!model.length"
        class="file-input-wrapper-hint"
      >
        <div
          i-material-symbols:upload
          h="16"
          w="16"
        />
        <div
          flex="~ col"
          text="center"
          p="x-3"
        >
          {{ $t('file.upload', multi ? 2 : 1) }}
        </div>
      </div>
    </div>
  </Field>
</template>

<style scoped lang="scss">
.file-input-wrapper {
  @apply min-h-50 border-2 border-dashed p-2 rounded-3 relative  overflow-auto;
  @apply dark:border-true-gray-600/50 border-true-gray-300/80;
  @apply dark:bg-darker bg-white;

  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));

  &.is-dragger-over,
  &:hover {
    @apply dark:border-true-gray-600 border-true-gray-300;

    .file-input-wrapper-hint {
      @apply color-darker dark:color-light-800;
    }
  }

  &-hint {
    @apply absolute grid place-content-center place-items-center inset-0;
    @apply color-true-gray-500;
  }

  &:not(.is-readonly) {
    @apply cursor-pointer;
  }

  .file-add {
    @apply fit flex-gap-4 border-2 border-dotted border-primary;
    @apply min-h-146px; // This is the height of the file preview
  }
}

.wrapper__body.has-error {
  .file-input-wrapper {
    @apply border-negative;
  }
}
</style>
