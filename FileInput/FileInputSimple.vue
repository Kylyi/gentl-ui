<script setup lang="ts">
// TYPES
import type { IFileInputProps } from '~~/components/FileInput/types/file-input-props.type'

// COMPOSITION FUNCTIONS
import { useFieldUtils } from '~~/components/Field/functions/useFieldUtils'
import { useNumber } from '~/components/Inputs/NumberInput/functions/useNumber'

// COMPONENTS
import ScrollArea from '~~/components/ScrollArea/ScrollArea.vue'

const props = withDefaults(defineProps<IFileInputProps>(), {
  maxChipsRows: 3,
})
const emits = defineEmits<{
  (e: 'update:modelValue', value: File[]): void
  (e: 'filesAdded', value: File[]): void
  (e: 'filesRemoved', value: File[]): void
}>()

// UTILS
const { formatBytes } = useNumber()
const { getFieldProps } = useFieldUtils()

// LAYOUT
const optionsContainerEl = ref<any>()
const model = useVModel(props, 'modelValue', emits)
const fieldProps = getFieldProps(props)
const { open, onChange, reset } = useFileDialog({
  accept: props.accept,
  multiple: props.multi,
})

const maxHeight = computedEager(() => {
  return props.maxChipsRows * 26
})

onChange(files => {
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
})

function getFileLabel(file: File) {
  return `${file.name} (${formatBytes(file.size)})`
}

function handleRemove(idx: number) {
  if (!model.value) {
    return
  }

  const removed = model.value.splice(idx, 1)
  emits('filesRemoved', removed)
  emits('update:modelValue', [...model.value])
}
</script>

<template>
  <Field
    v-bind="fieldProps"
    :no-content="!model?.length && !placeholder"
  >
    <template #append>
      <Btn
        icon="material-symbols:attachment"
        size="sm"
        m="x-2"
        @click.stop.prevent="open"
      />
    </template>

    <Component
      :is="scroller ? 'div' : ScrollArea"
      v-if="model?.length"
      ref="optionsContainerEl"
      flex="~ 1 wrap gap-1"
      box="content"
      p="y-0.5 l-0"
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
        />
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
        />
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
