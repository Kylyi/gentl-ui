<script setup lang="ts">
import { config } from '~/config'

// Types
import type { IFileInputProps } from '~/components/FileInput/types/file-input-props.type'

// Functions
import { useFieldUtils } from '~/components/Field/functions/useFieldUtils'

const props = withDefaults(defineProps<IFileInputProps>(), {
  maxChipsRows: 3,
  downloadUrl: config.fileInput.downloadUrl,
})
const emits = defineEmits<{
  (e: 'update:modelValue', value: Array<File | IFile>): void
  (e: 'filesAdded', value: Array<File | IFile>): void
  (e: 'filesRemoved', value: Array<File | IFile>): void
}>()

// Utils
const { getFieldProps } = useFieldUtils()
const { files } = useFiles()

// Layout
const fileInputWrapperEl = ref<HTMLDivElement>()
const model = defineModel<Array<File | IFile>>({
  default: [],
})
const fieldProps = getFieldProps(props)

const wrapperClass = computed(() => {
  return {
    'is-dragger-over': isOverDropZone.value,
    'is-disabled': props.disabled,
    'is-readonly': props.readonly,
  }
})

// File handling
const { isOverDropZone } = useDropZone(fileInputWrapperEl, handleAdd)
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

  const filesArray = Array.from(files)
  emits('filesAdded', filesArray)

  if (props.multi) {
    model.value = [...(model.value || []), ...filesArray]
  } else {
    model.value = filesArray
  }

  reset()
}

function handleRemove(idx: number) {
  if (!model.value) {
    return
  }

  const removed = model.value.slice(idx, 1)
  emits('filesRemoved', removed)
  model.value = model.value.filter((_, i) => i !== idx)
}

onChange(handleAdd)
syncRef(model, files, { direction: 'ltr' })
</script>

<template>
  <Field
    v-bind="fieldProps"
    :no-content="!model?.length"
    no-border
    control-class="!p-0"
    stack-label
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
        :file="file"
        :editable="!readonly && !disabled"
        :no-download-button="noDownloadButton"
        :download-url="downloadUrl"
        @remove="handleRemove(idx)"
      />

      <!-- Add file(s) -->
      <Btn
        v-if="model.length && !readonly && !disabled"
        class="file-add"
        icon="eva:plus-fill h-8 w-8"
        size="auto"
        stacked
        color="primary"
        :label="$t('file.add', 1)"
      />

      <div
        v-else-if="!model.length"
        class="file-input-wrapper-hint"
      >
        <div
          ic:sharp-cloud-upload
          h="16"
          w="16"
        />
        <div
          text="center"
          p="x-3"
        >
          {{ $t('file.uploadOrDnD') }}
        </div>
      </div>
    </div>
  </Field>
</template>

<style scoped lang="scss">
.file-input-wrapper {
  --apply: grid gap-2 border-2 border-dashed p-2 rounded-3 relative min-h-35 overflow-auto;
  --apply: dark:border-true-gray-600/50 border-true-gray-300/80;
  --apply: dark:bg-darker bg-white;

  grid-template-columns: repeat(auto-fit, minmax(140px, 320px));

  &.is-dragger-over,
  &:hover {
    --apply: dark:border-true-gray-600 border-true-gray-300;

    .file-input-wrapper-hint {
      --apply: color-darker dark:color-light-800;
    }
  }

  &-hint {
    --apply: absolute grid place-items-center inset-0;
    --apply: color-true-gray-500;
  }

  &:not(.is-readonly) {
    --apply: cursor-pointer;
  }


  .file-add {
    --apply: fit flex-gap-4 border-2 border-dotted border-primary min-h-50;
  }
}

.wrapper-body.has-error {
  .file-input-wrapper {
    --apply: border-negative;
  }
}
</style>
