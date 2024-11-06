<script setup lang="ts">
import { EditorContent } from '@tiptap/vue-3'

// Types
import type { IWysiwygMentionSetup } from '~/components/Wysiwyg/types/wysiwyg-mention-setup.type'
import type { IWysiwygProps } from '~/components/Wysiwyg/types/wysiwyg-props.type'

// Functions
import { useInputWrapperUtils } from '~/components/Inputs/functions/useInputWrapperUtils'
import { useWysiwygInit } from '~/components/Wysiwyg/functions/useWysiwygInit'
import { useWysiwygInjections } from '~/components/Wysiwyg/functions/useWysiwygInjections'
import { useWysiwygUtils } from '~/components/Wysiwyg/functions/useWysiwygUtils'

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
const uuid = injectLocal(wysiwygIdKey, useId()) as string
const model = defineModel<any>()
const visuals = defineModel<IWysiwygProps['visuals']>('visuals', { default: () => ({}) })

const bodyId = computed(() => {
  return visuals.value?.body?.['--id']
})

if (!bodyId.value) {
  set(visuals.value!, 'body.[--id]', generateUUID())
}

provideLocal(wysiwygIdKey, uuid)
provideLocal(wysiwygModelKey, model)

// Store
const wysiwygStore = useWysiwygStore(undefined)
const { isFocused, files, mentionSetup } = storeToRefs(wysiwygStore)

wysiwygStore.init(props)

// Init files
watch(
  () => props.files,
  propsFiles => {
    files.value = propsFiles ?? []
  },
  { immediate: true },
)

// Init mentions
const mentionSetupOriginal = defineModel<IWysiwygMentionSetup[]>('mentionSetup')

syncRef(mentionSetupOriginal, mentionSetup, { direction: 'ltr' })

// Utils
const {
  editor,
  mentionEl,
  getRect,
  isEditable,
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
const isEditDialogOpen = defineModel<boolean>('editDialog')
const wrapperProps = getInputWrapperProps(props)

// const bodyClass = computed(() => {
//   return
// })

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

    const { $from, $anchor, $head } = selection
    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth)
      // console.log('node' in selection ? selection.node?.type?.name : node?.type?.name)

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
      :editor
      min-h="50"
      :class="editorClass"
      :style="editorStyle"
      :data-id="`body_${bodyId}`"
      @drop.stop.prevent
    />

    <WysiwygMention
      ref="mentionEl"
      :load-data="loadMentionData"
      :list-props="mentionListProps"
      :get-rect
      :select-fnc
    />

    <WysiwygEditDialog
      v-model:edit-dialog="isEditDialogOpen"
      v-model="model"
      v-model:visuals="visuals"
      :features
      :sink
      :editable="isEditable"
    />

    <WysiwygElementOptions
      v-if="selectedDom && isEditable"
      :dom="selectedDom?.domEl"
      :type="selectedDom.type"
      :pos="selectedDom.pos"
    />

    <template #menu>
      <WysiwygSink
        v-if="editor"
        :features
        :sink
        :editable="isEditable"
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
