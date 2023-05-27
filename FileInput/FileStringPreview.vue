<script setup lang="ts">
// CONSTANTS

import { ICON_BY_FILE_EXTENSION } from '~~/components/FileInput/constants/iconsByFileExtension'

type IProps = {
  actions?: {
    download?: boolean
    launch?: boolean
    remove?: boolean
  }
  editable?: boolean
  filename: string
  folder?: string
}

const props = defineProps<IProps>()
defineEmits<{
  (e: 'remove'): void
}>()

// UTILS
const rC = useRuntimeConfig()
const { getLocalImageUrl } = useImages()
const imageExtensions = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'svg',
  'webp',
  'bmp',
  'ico',
  'tiff',
  'tif',
  'jfif',
  'pjpeg',
  'pjp',
  'avif',
  'apng',
]

// ACTIONS
const actionsDefault = ref({
  download: true,
  launch: false,
  remove: true,
})

const actions = computed(() => ({
  ...actionsDefault.value,
  ...props.actions,
}))

// LAYOUT
const folderPath = props.folder ? `${props.folder}/` : ''
const fileUrl = `${rC.public.FILES_HOST}/${folderPath}${props.filename}`

const icon = computed(() => {
  const ext = getFileExtension(props.filename)

  const icon =
    ICON_BY_FILE_EXTENSION[ext as keyof typeof ICON_BY_FILE_EXTENSION] ||
    'bi:file-image'

  return icon
})

const imageUrl = computed(() => {
  const isImage = imageExtensions.some(ext => props.filename.endsWith(ext))

  if (isImage) {
    return getLocalImageUrl(props.filename, { folder: props.folder })
  }

  return null
})

function handleDownloadFile() {
  // FIXME: Missing downloadFile function
  // downloadFile(props.filename, { folder: props.folder })
}
</script>

<template>
  <div class="file-preview">
    <!-- HEADER -->
    <div class="file-preview--header">
      <span
        self-center
        text="caption"
        line-clamp="2"
      >
        {{ getFileName(filename) }}
      </span>

      <div flex="~">
        <!-- REMOVE -->
        <Btn
          v-if="editable && actions.remove"
          size="xs"
          preset="TRASH"
          self-start
        >
          <MenuConfirmation
            :title="$t('file.remove')"
            @ok="$emit('remove')"
          />
        </Btn>
      </div>
    </div>

    <!-- BODY -->
    <div
      class="file-preview--image"
      external
      :to="fileUrl"
    >
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="filename"
        height="100"
      />

      <div
        v-else
        :class="icon"
        h="10"
        w="10"
      />
    </div>

    <!-- DOWNLOAD -->
    <Btn
      v-if="actions.download"
      size="sm"
      w-full
      :rounded="false"
      icon="material-symbols:download"
      self-start
      :label="$t('file.download')"
      @click="handleDownloadFile"
    />
  </div>
</template>

<style lang="scss" scoped>
.file-preview {
  --apply: flex flex-col gap-4 fit items-center w-full
      border-1 border-dotted rounded-3 border-ca color-ca;

  &--header {
    --apply: flex flex-row gap-x-2 p-x-2 w-full justify-between p-t-1 p-b-2;
  }

  &--image {
    --apply: flex flex-center p-b-4 p-x-3;

    img {
      --apply: rounded-3 object-cover object-center h-20;
    }
  }

  &:hover {
    --apply: bg-ca color-dark dark:color-light;
  }
}
</style>
