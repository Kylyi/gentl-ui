<script setup lang="ts">
import type { Required } from 'utility-types'

// Models
import { FileModel } from '~/components/FileInput/models/file.model'

// Functions
import { useNumber } from '~/components/Inputs/NumberInput/functions/useNumber'

// Constants
import { ICON_BY_FILE_TYPE } from '~/components/FileInput/constants/iconByFileType'
import { IMAGE_TYPES } from '~/components/FileInput/constants/imageTypes'
import { VIDEO_TYPES } from '~/components/FileInput/constants/videoTypes'

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
const { formatBytes } = useNumber()
const { getLocalImageUrl } = useImages()
const { createDialog } = useDialog()

const icon = computed(() => {
  const icon = ICON_BY_FILE_TYPE[props.file.type as keyof typeof ICON_BY_FILE_TYPE]
    || 'i-solar:file-linear'

  return icon
})

const size = computed(() => {
  return props.file instanceof FileModel
    ? formatBytes(props.file.file.size)
    : formatBytes(props.file.size ?? 0)
})

const imageUrl = computed(() => {
  const isImageFile = IMAGE_TYPES.includes(props.file.type ?? '')

  if (!isImageFile) {
    return null
  }

  if (props.file instanceof FileModel) {
    return URL.createObjectURL(props.file.file)
  } else {
    return getLocalImageUrl(props.file.path)
  }
})

const videoUrl = computed(() => {
  const isVideoFile = VIDEO_TYPES.includes(props.file.type ?? '')

  if (!isVideoFile) {
    return null
  }

  if (props.file instanceof FileModel) {
    return URL.createObjectURL(props.file.file)
  } else {
    return getLocalImageUrl(props.file.path)
  }
})

const downloadUrl = computedAsync(async () => {
  const file = props.file instanceof FileModel
    ? props.file.uploadedFile
    : props.file as Required<IFile, 'name' | 'path'>

  if (!file) {
    return
  }

  const name = 'name' in file ? file.name : file.newFilename
  const path = 'path' in file ? file.path : file.filepath

  return await handleDownloadFile(
    { name, path },
    { returnUrlOnly: true },
  )
})

function handleImageClick(url: string) {
  createDialog({ class: '!w-auto !h-auto' }, {
    children: {
      default: () => {
        return h('img', {
          src: url,
          width: 'auto',
          height: 'auto',
          class: 'w-auto h-auto',
        })
      },
    },
  })
}
</script>

<template>
  <div class="file-preview">
    <div class="file-preview__header">
      <!-- Icon -->
      <div class="i-material-symbols:attachment color-ca shrink-0" />

      <div
        flex="~ col grow"
        overflow-auto
      >
        <!-- Filename -->
        <span class="file-preview__filename">
          {{ file?.name }}
        </span>

        <!-- Meta -->
        <div class="file-preview__meta">
          <!-- Size -->
          <span>{{ size }}</span>

          <Separator vertical />

          <!-- Download -->
          <NuxtLink
            v-if="downloadUrl"
            class="link"
            :to="downloadUrl"
            external
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ $t('general.download') }}
          </NuxtLink>
        </div>
      </div>

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
        max-w="60"
        aspect-ratio="16/9"
        cursor="pointer"
        object="contain"
        @click.stop.prevent="handleImageClick(imageUrl)"
        @mousedown.stop.prevent
      >

      <!-- Video preview -->
      <video
        v-else-if="videoUrl"
        :src="videoUrl"
        controls
        muted
        loop
        playsinline
        class="file-preview__video"
      />

      <!-- Icon -->
      <div
        v-else
        :class="icon"
        h="10"
        w="10"
      />

      <!-- Upload state -->
      <div
        v-if="file instanceof FileModel && !file.isUploaded"
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

          <p text="caption">
            {{ $t('file.added') }}
          </p>

          <span
            text="xs caption"
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

      <!-- Overlay -->
      <div
        v-if="imageUrl"
        class="file-preview__overlay"
      >
        <div class="i-ph:eye-bold font-rem-24" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.file-preview {
  @apply grid gap-2 fit items-center border-1 border-dotted rounded-3
    border-ca color-ca max-w-80;

  grid-template-rows: auto 1fr;

  &__filename {
    @apply text-caption font-rem-12 line-clamp-2 break-words leading-tight;
  }

  &__meta {
    @apply flex gap-1 items-center text-caption font-rem-11 line-clamp-2 break-words leading-tight;
  }

  &__header {
    @apply flex flex-row gap-x-2 p-x-2 w-full justify-between p-y-1
      overflow-auto;
  }

  &__image {
    @apply relative flex flex-center p-1 fit overflow-auto min-h-20;

    img {
      @apply rounded-3 object-cover object-center;
    }
  }

  &__video {
    @apply rounded-custom w-100;
  }

  &__state {
    @apply absolute inset-0 flex flex-center flex-col gap-2 p-2 rounded-3 bg-white dark:bg-darker;
  }

  &__overlay {
    @apply absolute flex flex-center gap-2 inset-0 rounded-custom invisible pointer-events-none;
  }

  &:hover {
    @apply shadow-consistent-xs shadow-ca color-dark dark:color-light;

    .file-preview__overlay {
      @apply visible bg-darker/15;
    }
  }
}
</style>
