<script setup lang="ts">
import { config } from '~/components/config/components-config'

// Types
import type { IFileInputProps } from '~/components/FileInput/types/file-input-props.type'

// Models
import { FileModel } from '~/components/FileInput/models/file.model'

// Functions
import { useFieldUtils } from '~/components/Field/functions/useFieldUtils'
import { useNumber } from '~/components/Inputs/NumberInput/functions/useNumber'

// Components
import ScrollArea from '~/components/ScrollArea/ScrollArea.vue'
import Field from '~/components/Field/Field.vue'

const props = withDefaults(defineProps<IFileInputProps>(), {
  maxChipsRows: 3,
  downloadUrl: config.fileInput.props.downloadUrl,
})

const emits = defineEmits<{
  (e: 'update:modelValue', value: Array<FileModel | IFile>): void
  (e: 'filesAdded', value: Array<FileModel | IFile>): void
  (e: 'filesRemoved', value: Array<FileModel | IFile>): void
  (e: 'focus'): void
  (e: 'blur'): void
}>()

// Utils
const { formatBytes } = useNumber()
const { getFieldProps } = useFieldUtils()

// Layout
const fileInputEl = ref<InstanceType<typeof Field>>()
const optionsContainerEl = ref<any>()
const model = defineModel<Array<FileModel | IFile>>({
  default: [],
})
const fieldProps = getFieldProps(props)

// FileModel handling
const { open, onChange, reset } = useFileDialog({
  accept: props.accept,
  multiple: props.multi,
})

const { isOverDropZone } = useDropZone(
  // @ts-expect-error wrong html tag type
  () => unrefElement(fileInputEl),
  handleAdd,
)

const maxHeight = computed(() => {
  return props.maxChipsRows * 26
})

function getFileLabel(file: FileModel | IFile) {
  const size = file instanceof FileModel ? file.file.size : file.size

  return `${file.name} (${formatBytes(size)})`
}

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
</script>

<template>
  <Field
    v-bind="fieldProps"
    ref="fileInputEl"
    :no-content="!model?.length && !placeholder"
    :class="{ 'dragged-over': isOverDropZone }"
    @click="handleOpen"
  >
    <template #append>
      <Btn
        icon="i-material-symbols:attachment"
        size="sm"
        m="x-2"
        @click.stop.prevent="handleOpen"
      />
    </template>

    <Component
      :is="scroller ? 'div' : ScrollArea"
      v-if="model?.length"
      ref="optionsContainerEl"
      flex="~ 1 wrap gap-1"
      box="content"
      p="y-0.5 inline-0"
      tabindex="0"
      :class="{ 'is-multi': !!multi }"
      :style="{ maxHeight: `${maxHeight}px` }"
    >
      <HorizontalScroller
        v-if="scroller"
        content-class="flex-gap-x-2"
        arrows="outside"
      >
        <Chip
          v-for="(chip, idx) in modelValue"
          :key="idx"
          :label="getFileLabel(chip)"
          min-w="20"
          p="!y-1px"
          :has-remove="!(readonly || disabled)"
          @remove="handleRemove(idx)"
        >
          <!-- Download btn -->
          <Btn
            v-if="'path' in chip"
            size="auto"
            w="4"
            h="4"
            bg="primary"
            color="white"
            self-center
            icon="i-material-symbols:download"
            @click.stop.prevent="handleDownloadFile(chip, { url: downloadUrl })"
            @mousedown.stop.prevent
          />

          <span truncate>
            {{ getFileLabel(chip) }}
          </span>
        </Chip>
      </HorizontalScroller>

      <template v-else>
        <Chip
          v-for="(chip, idx) in modelValue"
          :key="idx"
          :label="getFileLabel(chip)"
          :has-remove="!(readonly || disabled)"
          min-w="20"
          p="!y-1px"
          @remove="handleRemove(idx)"
        >
          <!-- Download btn -->
          <Btn
            v-if="'path' in chip && !noDownloadButton"
            size="auto"
            bg="primary"
            color="white"
            w="4"
            h="4"
            self-center
            icon="i-material-symbols:download"
            class="!rounded-1"
            @click.stop.prevent="handleDownloadFile(chip, { url: downloadUrl })"
            @mousedown.stop.prevent
          >
            <Tooltip :offset="10">
              {{ $t('general.downloadFile') }}
            </Tooltip>
          </Btn>

          <span truncate>
            {{ getFileLabel(chip) }}
          </span>
        </Chip>
      </template>
    </Component>

    <span
      v-if="placeholder && !model?.length"
      class="placeholder"
    >
      {{ placeholder }}
    </span>
  </Field>
</template>
