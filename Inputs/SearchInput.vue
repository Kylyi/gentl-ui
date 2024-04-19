<script setup lang="ts">
// Types
import type { ITextInputProps } from '~/components/Inputs/TextInput/types/text-input-props.type'

// Components
import TextInput from '~/components/Inputs/TextInput/TextInput.vue'

withDefaults(defineProps<ITextInputProps>(), {
  debounce: 0,
  required: undefined,
})
defineEmits<{
  (e: 'update:model-value', val?: string | undefined | null): void
}>()

const searchEl = ref<InstanceType<typeof TextInput>>()

defineExpose({
  clear: () => searchEl.value?.clear(),
  focus: () => searchEl.value?.focus(),
  blur: () => searchEl.value?.blur(),
  select: () => searchEl.value?.select(),
})
</script>

<template>
  <TextInput
    ref="searchEl"
    :model-value="modelValue"
    :debounce="debounce"
    class="control"
    :autofocus="autofocus"
    name="_search"
    immediate
    empty-value=""
    :hint="hint"
    :layout="layout"
    :input-class="inputClass"
    :input-style="inputStyle"
    :loading="loading"
    :ui="ui"
    :input-props="inputProps"
    :placeholder="placeholder ?? $t('general.search')"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #prepend>
      <slot name="prepend" />
      <div
        v-if="!$slots.prepend"
        carbon:search
        color="ca"
        m="l-2"
      />
    </template>

    <template #append="{ clear }">
      <slot name="append" />

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
          data-cy="clear-search"
          @click="clear()"
        />
      </div>
    </template>
  </TextInput>
</template>
