<script setup lang="ts">
// Types
import type { IFile } from '~/components/FileInput/types/file.type'

// Constants
import { ICON_BY_FILE_EXTENSION } from '~/components/FileInput/constants/iconsByFileExtension'

// Functions

type IProps = {
  actions?: {
    download?: boolean
    remove?: boolean
  }
  downloadUrl?: string
  editable?: boolean
  file: IFile
}

const props = defineProps<IProps>()
defineEmits<{
  (e: 'remove'): void
}>()

// Utils
const rC = useRuntimeConfig()
const { getLocalImageUrl } = useImages()

// Actions
const actionsDefault = ref({
  download: true,
  remove: true,
})

const actions = computed(() => ({
  ...actionsDefault.value,
  ...props.actions,
}))

// Layout
const fileUrl = `${rC.public.FILES_HOST}/files${props.file.path}`

const icon = computed(() => {
  const ext = getFileExtension(props.file.name)

  const icon =
    ICON_BY_FILE_EXTENSION[ext as keyof typeof ICON_BY_FILE_EXTENSION] ||
    'bi:file-image'

  return icon
})

const imageUrl = computed(() => {
  const isImage = props.file.type.startsWith('image/')

  if (isImage) {
    return getLocalImageUrl(props.file.path)
  }

  return null
})
</script>

<template>
  <div class="file-preview">
    <!-- Header -->
    <div class="file-preview--header">
      <span
        self-center
        text="caption"
        line-clamp="2"
      >
        {{ file.name }}
      </span>

      <div flex="~">
        <!-- Remove -->
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

    <!-- Body -->
    <div
      class="file-preview--image"
      external
      :to="fileUrl"
    >
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="file.name"
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
      @click.stop.prevent="handleDownloadFile(file, downloadUrl)"
    />
  </div>
</template>

<style lang="scss" scoped>
.file-preview {
  --apply: flex flex-col gap-4 fit items-center w-full border-1 border-dotted
    rounded-3 border-ca color-ca;
  --apply: dark:bg-darker bg-white;

  &--header {
    --apply: flex flex-row gap-x-2 p-x-2 w-full justify-between p-t-1 p-b-2;
  }

  &--image {
    --apply: flex flex-center p-b-4 p-x-3;

    img {
      --apply: rounded-3 object-cover object-center h-20;
    }
  }
}
</style>
