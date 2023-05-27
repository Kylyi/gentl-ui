<script setup lang="ts">
// TYPES
import type { IFileInputProps } from '~~/components/FileInput/types/file-input-props.type'

const props = withDefaults(defineProps<IFileInputProps>(), {
  modelValue: () => [],
  multi: true,
})

const emits = defineEmits<{
  (e: 'update:model-value', value: File[]): void
  (e: 'files-added', value: File[]): void
  (e: 'files-removed', value: File[]): void
}>()

// LAYOUT
const fileInputEl = ref<HTMLInputElement>()
const dragCounter = ref(0)
const filesInternal = ref<File[] | null>(props.modelValue)

function triggerFileInput() {
  if (props.disabled || props.readonly) {
    return
  }

  fileInputEl.value?.click()
}

function handleFiles(files: FileList) {
  const filesArr = Array.from(files)
  filesInternal.value = [...(filesInternal.value || []), ...filesArr]

  emits('files-added', filesArr)
  emits('update:model-value', [...filesInternal.value])
}

function handleFileManual(ev: Event) {
  const files = (ev.target as HTMLInputElement)?.files

  if (!files) {
    return
  }

  handleFiles(files)
}

function handleDrop(ev: DragEvent) {
  dragCounter.value = 0

  if (props.disabled || props.readonly) {
    return
  }

  const files = ev.dataTransfer?.files

  if (!files) {
    return
  }

  handleFiles(files)
}

function removeFile(idx: number) {
  if (!filesInternal.value) {
    return
  }

  const files = filesInternal.value.splice(idx, 1)
  emits('files-removed', files)
  emits('update:model-value', [...filesInternal.value])
}
</script>

<template>
  <div flex="~ col">
    <div
      class="file-input"
      :class="{
        'is-dragging': dragCounter > 0,
        'is-readonly': readonly,
        'is-disabled': disabled,
        'is-multi': multi,
      }"
      @click="triggerFileInput"
      @drop.prevent.stop="handleDrop"
      @dragenter.prevent="dragCounter++"
      @dragover.prevent
      @dragleave.prevent="dragCounter--"
    >
      <Chip
        v-if="loading"
        position="!absolute"
        top="-14px"
        right-2
        bg="primary"
        color="white"
        :label="$t('uploadingFiles')"
      >
        <LoaderInline
          color="white"
          size="xs"
        />
      </Chip>

      <div
        v-if="!filesInternal?.length"
        flex="~ col center"
        p="y-8"
        class="dropzone-info"
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
          {{ $t('filesUpload') }}
        </div>
      </div>

      <div
        v-else
        class="file-input-preview"
      >
        <FilePreview
          v-for="(file, idx) in filesInternal"
          :key="idx"
          :file="file"
          @remove="removeFile(idx)"
        />
      </div>

      <input
        ref="fileInputEl"
        type="file"
        invisible
        absolute
        inset-0
        z="-1"
        :multiple="multi"
        :accept="accept"
        @change="handleFileManual"
      />
    </div>

    <ErrorContainer
      :error-takes-space="errorTakesSpace"
      :errors="errors"
      class="wrapper-error"
    />

    <HintContainer
      v-if="!errors?.length && hint"
      :hint="hint"
    />
  </div>
</template>

<style lang="scss" scoped>
.file-input {
  --apply: relative flex border-2 border-dashed w-full dark:bg-darker bg-white
    rounded-3 flex-center cursor-pointer dark:border-true-gray-600/50 border-true-gray-300/50;

  &.is-readonly {
    --apply: cursor-default;
  }

  &.is-disabled {
    --apply: cursor-not-allowed;
  }

  &-preview {
    --apply: grid p-3 grid-cols-1 xm:grid-cols-2 md:grid-cols-3 gap-3 h-full w-full;
  }

  &:not(.is-multi) {
    .file-input-preview {
      --apply: grid-cols-1;
    }
  }

  &.is-dragging,
  &:not(.is-disabled):not(.is-readonly):hover {
    --apply: dark:border-true-gray-600 border-true-gray-300;

    .dropzone-info {
      --apply: color-dark dark:color-light;
    }
  }

  .dropzone-info {
    --apply: flex flex-col flex-center p-y-8 color-ca;
  }
}
</style>
