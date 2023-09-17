<script setup lang="ts">
// TYPES
import type { ITextInputProps } from '~/components/Inputs/TextInput/types/text-input-props.type'

// COMPONENTS
import TextInput from '~/components/Inputs/TextInput/TextInput.vue'

withDefaults(defineProps<ITextInputProps>(), {
  debounce: 20,
})
defineEmits<{
  (e: 'update:model-value', val?: string | undefined | null): void
}>()

const searchEl = ref<InstanceType<typeof TextInput>>()

defineExpose({
  clear: () => searchEl.value?.clear(),
  focus: () => searchEl.value?.focus(),
})
</script>

<template>
  <TextInput
    ref="searchEl"
    :model-value="modelValue"
    :debounce="debounce"
    class="control"
    :autofocus="autofocus"
    name="search"
    immediate
    empty-value=""
    :hint="hint"
    :input-class="inputClass"
    :content-class="contentClass"
    :input-style="inputStyle"
    :placeholder="placeholder ?? $t('general.search')"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #prepend>
      <div
        carbon:search
        color="ca"
        m="l-2"
      />
    </template>

    <template #append="{ clear }">
      <div
        v-if="modelValue || $slots.append"
        flex="~ center gap-1"
        m="r-1"
        fit
      >
        <Btn
          v-if="modelValue"
          size="auto"
          w="8"
          h="8"
          icon="carbon:close text-2xl"
          color="ca"
          @click="clear()"
        />

        <slot name="append" />
      </div>
    </template>
  </TextInput>
</template>
