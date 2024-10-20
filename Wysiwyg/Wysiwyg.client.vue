<script setup lang="ts">
import { EditorContent } from '@tiptap/vue-3'

// Types
import type { IWysiwygProps } from '~/components/Wysiwyg/types/wysiwyg-props.type'
import type { IWysiwygMentionSetup } from '~/components/Wysiwyg/types/wysiwyg-mention-setup.type'

// Functions
import { useWysiwygInit } from '~/components/Wysiwyg/functions/useWysiwygInit'
import { useWysiwygUtils } from '~/components/Wysiwyg/functions/useWysiwygUtils'
import { useWysiwygInjections } from '~/components/Wysiwyg/functions/useWysiwygInjections'
import { useInputWrapperUtils } from '~/components/Inputs/functions/useInputWrapperUtils'

// Injections
import { wysiwygIdKey, wysiwygModelKey } from '~/components/Wysiwyg/provide/wysiwyg.provide'

// Store
import { useWysiwygStore } from '~/components/Wysiwyg/wysiwyg.store'

// Components
import WysiwygMention from '~/components/Wysiwyg/WysiwygMention.vue'
import WysiwygSink from '~/components/Wysiwyg/WysiwygSink.vue'

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
  setModel: (content: string) => model.value = content,
})

// Init
const self = getCurrentInstance()
const uuid = useId() as string
const model = defineModel<any>()

provideLocal(wysiwygIdKey, uuid)
provideLocal(wysiwygModelKey, model)

// Store
const wysiwygStore = useWysiwygStore()
const { isFocused, files, mentionSetup } = storeToRefs(wysiwygStore)

// Init files
watch(
  () => props.files,
  propsFiles => {
    files.value = propsFiles ?? []
  },
  { immediate: true },
)

// Init
const mentionSetupOriginal = defineModel<IWysiwygMentionSetup[]>('mentionSetup')

syncRef(mentionSetupOriginal, mentionSetup, { direction: 'ltr' })

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

const selectedDom = ref<{ type: 'table', domEl: HTMLElement, pos: number } | null>(null)

watch(
  () => editor.value?.state?.selection,
  () => {
    const { view, state } = editor.value ?? {}
    const { selection } = state ?? {}

    if (!view || !selection) {
      selectedDom.value = null

      return
    }

    const { $from, $anchor } = selection
    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth)

      if (node.type.name === 'table') {
        const pos = $from.before(depth)
        const wrapperEl = view.nodeDOM(pos) as HTMLElement
        const tableEl = wrapperEl.querySelector('table')

        if (!tableEl) {
          continue
        }

        if (wrapperEl.clientWidth < tableEl.clientWidth) {
          selectedDom.value = {
            type: 'table',
            domEl: wrapperEl as HTMLElement,
            pos: $anchor.pos,
          }

          return
        } else {
          selectedDom.value = {
            type: 'table',
            domEl: tableEl as HTMLElement,
            pos: $anchor.pos,
          }

          return
        }
      }
    }

    selectedDom.value = null
  },
)

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

    <WysiwygElementOptions
      v-if="selectedDom"
      :dom="selectedDom?.domEl"
      :type="selectedDom.type"
      :pos="selectedDom.pos"
    />

    <template #menu>
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
    </template>
  </InputWrapper>
</template>

<style lang="scss" scoped>
@import url('style/wysiwyg.style.scss');
</style>
