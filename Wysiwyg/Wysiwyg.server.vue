<script setup lang="ts">
// Types
import type { IWysiwygProps } from '~/components/Wysiwyg/types/wysiwyg-props.type'

// Functions
import { useInputWrapperUtils } from '~/components/Inputs/functions/useInputWrapperUtils'

// Constants
import { useWysiwygUtils } from '~/components/Wysiwyg/functions/useWysiwygUtils'

const props = defineProps<IWysiwygProps>()

// Utils
const isServer = !!import.meta.server
const { getInputWrapperProps } = useInputWrapperUtils()
const { resolveMentions } = useWysiwygUtils()

// Layout
const el = ref<HTMLParagraphElement>()
const model = toRef(props, 'modelValue')

// Wrapper
const wrapperProps = getInputWrapperProps(props)

// This only happens when we explicity use the `Wysiwyg.server.vue` component
// because normally, on server side, we don't have the `onMounted` hook
onMounted(() => {
  nextTick(() => {
    const shouldResolveMentions = props.mentionResolve || props.mentionReplace

    if (shouldResolveMentions && el.value) {
      resolveMentions(
        undefined,
        props.mentionReplace,
        { ...props, el: el.value },
      )
    }
  })
})
</script>

<template>
  <Field
    v-bind="wrapperProps"
  >
    <ClientOnly>
      <p
        ref="el"
        class="tiptap ProseMirror wysiwyg"
        v-html="model"
      />
    </ClientOnly>

    <p
      v-if="isServer"
      ref="el"
      class="tiptap ProseMirror wysiwyg"
      v-html="model"
    />
  </Field>
</template>

<style lang="scss" scoped>
@import url('style/wysiwyg.style.scss');

:deep(p:empty) {
  @apply min-h-26px;
}
</style>
