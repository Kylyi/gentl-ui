<script setup lang="ts">
import { config } from '~/components/config/components-config'

// Types
import type { IFileInputProps } from '~/components/FileInput/types/file-input-props.type'

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
  (e: 'update:modelValue', value: Array<File | IFile>): void
  (e: 'filesAdded', value: Array<File | IFile>): void
  (e: 'filesRemoved', value: Array<File | IFile>): void
}>()

// Utils
const { formatBytes } = useNumber()
const { getFieldProps } = useFieldUtils()

// Layout
const fileInputEl = ref<InstanceType<typeof Field>>()
const optionsContainerEl = ref<any>()
const model = useVModel(props, 'modelValue', emits)
const fieldProps = getFieldProps(props)

// File handling
const { open, onChange, reset } = useFileDialog({
  accept: props.accept,
  multiple: props.multi,
})

const { isOverDropZone } = useDropZone(
  // @ts-expect-error wrong html tag type
  () => unrefElement(fileInputEl),
  handleAdd
)

const maxHeight = computedEager(() => {
  return props.maxChipsRows * 26
})

function getFileLabel(file: File | IFile) {
  return `${file.name} (${formatBytes(file.size)})`
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

  const removed = model.value.splice(idx, 1)
  emits('filesRemoved', removed)
  emits('update:modelValue', [...model.value])
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
        icon="material-symbols:attachment"
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
            icon="material-symbols:download"
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
            icon="material-symbols:download"
            @click.stop.prevent="handleDownloadFile(chip, { url: downloadUrl })"
            @mousedown.stop.prevent
          >
            <Tooltip :offset="10"> {{ $t('general.downloadFile') }} </Tooltip>
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
