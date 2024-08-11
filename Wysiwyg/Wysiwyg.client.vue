<script setup lang="ts">
import { EditorContent } from '@tiptap/vue-3'

// Types
import type { IWysiwygProps } from '~/components/Wysiwyg/types/wysiwyg-props.type'

// Functions
import { useWysiwygInit } from '~/components/Wysiwyg/functions/useWysiwygInit'
import { useWysiwygUtils } from '~/components/Wysiwyg/functions/useWysiwygUtils'
import { useInputWrapperUtils } from '~/components/Inputs/functions/useInputWrapperUtils'

// Components
import WysiwygMention from '~/components/Wysiwyg/WysiwygMention.vue'
import WysiwygSink from '~/components/Wysiwyg/WysiwygSink.vue'

// Injections
import { wysiwygIdKey, wysiwygModelKey } from '~/components/Wysiwyg/provide/wysiwyg.provide'
import { useWysiwygInjections } from '~/components/Wysiwyg/functions/useWysiwygInjections'

// Store
import { useWysiwygStore } from '~/components/Wysiwyg/wysiwyg.store'

const props = defineProps<IWysiwygProps>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'focus'): void
  (e: 'blur'): void
}>()

defineExpose({
  focus: focusEditor,
  blur: blurEditor,
  resolveMentions: (
    fnc?: IWysiwygProps['populateMention'],
    replace?: boolean,
  ) => resolveMentions(fnc, replace, props),
})

// Init
const uuid = useId()
const model = defineModel<any>()

provideLocal(wysiwygIdKey, uuid)
provideLocal(wysiwygModelKey, model)

// Store
const wysiwygStore = useWysiwygStore()
const { isFocused, files } = storeToRefs(wysiwygStore)

// Init files
files.value = props.files ?? []

// Utils
const {
  editor,
  mentionEl,
  getRect,
  loadMentionData,
  selectFnc,
  mentionListProps,
} = useWysiwygInit(props, model)
const { getInputWrapperProps } = useInputWrapperUtils()
const { transitionProps, resolveMentions } = useWysiwygUtils()

function focusEditor() {
  editor.value?.chain().focus().run()
}

function blurEditor() {
  editor.value?.commands.blur()
}

// Layout
const wrapperProps = getInputWrapperProps(props)

// Sync editor value with model when not focused
watch(model, model => {
  if (!isFocused.value) {
    editor.value?.chain().setContent(model ?? '').run()
  }
})

useWysiwygInjections({ model })

// Life cycle
onMounted(() => {
  nextTick(() => {
    const shouldResolveMentions = props.mentionResolve || props.mentionReplace

    if (shouldResolveMentions && editor.value) {
      resolveMentions(undefined, props.mentionReplace, props)
    }

    // Handle link click
    editor.value?.view.dom.addEventListener('click', event => {
      const target = event.target as HTMLElement
      const isCtrl = event.ctrlKey || event.metaKey

      if (target.classList.contains('link')) {
        const href = target.getAttribute('href')

        if (isCtrl && href) {
          window.open(href)
        }
      }
    })
  })
})

onBeforeUnmount(wysiwygStore.$dispose)
</script>

<template>
  <InputWrapper
    v-bind="wrapperProps"
    :has-content="!!modelValue"
    class="relative"
    .focus="focusEditor"
    @click="focusEditor"
  >
    <EditorContent
      class="control"
      :editor="editor"
      min-h="50"
      :class="editorClass"
      :style="editorStyle"
      @drop.stop.prevent
    />

    <WysiwygMention
      ref="mentionEl"
      :load-data="loadMentionData"
      :list-props="mentionListProps"
      :get-rect
      :select-fnc
    />

    <template #menu>
      <Transition
        appear
        v-bind="transitionProps"
      >
        <WysiwygSink
          v-if="editor"
          :class="{ 'is-floating': !noSinkFloat }"
          v-bind="$props"
        >
          <template
            v-if="$slots['sink-prepend']"
            #prepend
          >
            <slot name="sink-prepend" />
          </template>

          <template
            v-if="$slots['sink-append']"
            #append
          >
            <slot
              name="sink-append"
              :blur-editor="blurEditor"
            />
          </template>
        </WysiwygSink>
      </Transition>
    </template>
  </InputWrapper>
</template>

<style lang="scss" scoped>
@import url('style/wysiwyg.style.scss');
</style>
