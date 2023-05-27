<script setup lang="ts">
// TYPES
import type { IFilePreview } from '@/components/FileInput/types/file-preview.type'

// CONSTANTS
import { ICON_BY_FILE_TYPE } from '~~/components/FileInput/constants/iconByFileType'

type IProps = {
  file: IFilePreview
}

const props = defineProps<IProps>()
defineEmits<{
  (e: 'remove'): void
}>()

// UTILS

const icon = computed(() => {
  const icon =
    ICON_BY_FILE_TYPE[props.file.type as keyof typeof ICON_BY_FILE_TYPE] ||
    'bi:file-image'

  return icon
})

const imageUrl = computed(() => {
  if (props.file.type.startsWith('image/')) {
    return URL.createObjectURL(props.file)
  }

  return null
})
</script>

<template>
  <div class="file-preview">
    <div class="file-preview--header">
      <span
        self-center
        text="caption"
        line-clamp="2"
      >
        {{ file.name }}
      </span>

      <Btn
        size="xs"
        preset="CLOSE"
        self-start
        @click.stop.prevent="$emit('remove')"
      />
    </div>

    <div class="file-preview--image">
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
