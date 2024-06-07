<script setup lang="ts">
// Models
import type { FileModel } from '~/components/FileInput/models/file.model'

// Functions
import { useNumber } from '~/components/Inputs/NumberInput/functions/useNumber'

// Constants
import { ICON_BY_FILE_TYPE } from '~/components/FileInput/constants/iconByFileType'

type IProps = {
  downloadUrl?: string
  editable?: boolean
  file: FileModel | IFile
  noDownloadButton?: boolean
}

const props = defineProps<IProps>()
defineEmits<{
  (e: 'remove'): void
}>()

// Utils
const { formatNumber, formatBytes } = useNumber()
const { getLocalImageUrl } = useImages()

const icon = computed(() => {
  const icon
    = ICON_BY_FILE_TYPE[props.file.type as keyof typeof ICON_BY_FILE_TYPE]
    || 'i-solar:file-linear'

  return icon
})

const imageUrl = computed(() => {
  const isUploadedFile = 'id' in props.file
  const PREVIEWABLE_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'image/webp',
    'image/bmp',
  ]
  const isImageFile = PREVIEWABLE_IMAGE_TYPES.includes(props.file.type)

  if (isUploadedFile && isImageFile) {
    return getLocalImageUrl(props.file.path)
  } else if (!isUploadedFile && isImageFile) {
    return URL.createObjectURL(props.file.file)
  }

  return null
})
</script>

<template>
  <div class="file-preview">
    <div class="file-preview__header">
      <span class="file-preview__filename">
        {{ file?.name }}
      </span>

      <Btn
        v-if="editable"
        size="xs"
        preset="CLOSE"
        self-start
        @click.stop.prevent="$emit('remove')"
      />
    </div>

    <div class="file-preview__image">
      <!-- Image preview -->
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="file.name"
        h="full"
      >

      <!-- Icon -->
      <div
        v-else
        :class="icon"
        h="10"
        w="10"
      />

      <!-- Upload state -->
      <div
        v-if="!('path' in file) && !file.isUploaded"
        class="file-preview__state"
      >
        <!-- Upload failed -->
        <template v-if="file.hasError">
          <div class="i-ion:close color-negative h-12 w-12" />

          <span text="caption center">
            {{ $t('file.uploadFailed') }}
          </span>

          <Btn
            size="xs"
            color="negative"
            :label="$t('file.remove')"
            @click.stop.prevent="$emit('remove')"
          />
        </template>

        <!-- To be uploaded -->
        <template v-else-if="!file.isUploading && !file.isUploaded">
          <div class="i-ion:cloud-upload color-ca h-12 w-12" />

          <p>
            {{ $t('file.added') }}
          </p>

          <span
            text="xs"
            m="t--2"
          >
            {{ formatBytes(file.file.size) }}
          </span>

          <Btn
            size="xs"
            color="negative"
            :label="$t('file.remove')"
            @click.stop.prevent="$emit('remove')"
          />
        </template>

        <!-- Uploading -->
        <CircleProgress
          v-else
          :size="80"
          :progress="file.uploadProgress"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.file-preview {
  @apply grid gap-2 fit items-center border-1 border-dotted rounded-3
    border-ca color-ca;

  grid-template-rows: auto 1fr;

  &__filename {
    @apply self-center text-caption line-clamp-2 m-y-1 break-words;
  }

  &__header {
    @apply flex flex-row gap-x-2 p-x-2 w-full justify-between p-y-1
      overflow-auto;
  }

  &__image {
    @apply relative flex flex-center p-1 fit overflow-auto;

    img {
      @apply rounded-3 object-cover object-center;
    }
  }

  &__state {
    @apply absolute inset-0 flex flex-center flex-col gap-2 p-2 rounded-3 bg-ca;
  }

  &:hover {
    @apply shadow-consistent-xs shadow-ca color-dark dark:color-light;
  }
}
</style>
