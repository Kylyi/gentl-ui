<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'

// TipTap Extensions
import { StarterKit } from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { TextAlign } from '@tiptap/extension-text-align'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Mention } from '@tiptap/extension-mention'

// TYPES
import { ClientRectObject } from '@floating-ui/vue'

// TYPES
import type { IWysiwygProps } from '~~/components/Wysiwyg/types/wysiwyg-props.type'
import type { IWysiwygMentionItem } from '~/components/Wysiwyg/types/wysiwyg-mention-item.type'

// COMPONENTS
import WysiwygMention from '~/components/Wysiwyg/WysiwygMention.vue'

const props = withDefaults(defineProps<IWysiwygProps>(), {
  errorVisible: true,
})
const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// LAYOUT
const model = useVModel(props, 'modelValue', emits)
const isFocused = ref(false)

// WRAPPER
const wrapperProps = reactivePick(
  props,
  'contentClass',
  'contentStyle',
  'disabled',
  'emptyValue',
  'errors',
  'errorTakesSpace',
  'errorVisible',
  'hint',
  'inline',
  'label',
  'labelClass',
  'labelInside',
  'labelStyle',
  'noBorder',
  'loading',
  'placeholder',
  'readonly',
  'required',
  'size',
  'stackLabel'
)

// TipTap Extensions
// Placeholder https://tiptap.dev/api/extensions/placeholder
const PlaceholderExt = Placeholder.configure({
  placeholder: () => props.placeholder || '',
  emptyNodeClass: 'is-empty',
})

// TextAlign https://tiptap.dev/api/extensions/text-align
const TextAlignExt = TextAlign.configure({
  types: ['paragraph', 'heading'],
})

// Color https://tiptap.dev/api/extensions/color
const ColorExt = Color.configure({
  types: ['textStyle'],
})

// Mention https://tiptap.dev/api/nodes/mention
const mentionEl = ref<InstanceType<typeof WysiwygMention>>()
const selectFnc = ref<Function>(() => {})
const mentionItemsFiltered = ref<IWysiwygMentionItem[]>([])
const getRectFnc = ref<() => ClientRectObject>(function () {
  return {
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
  }
})

const MentionExt = Mention.configure({
  renderLabel: ({ node, options }) => {
    return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}}`
  },
  suggestion: {
    char: '${',
    items: ({ query }) => {
      if (!query) {
        mentionItemsFiltered.value = props.mentionItems || []
      }

      mentionItemsFiltered.value = (props.mentionItems || []).filter(item => {
        return item.label.toLowerCase().startsWith(query.toLowerCase())
      })

      return []
    },
    render: () => {
      return {
        onStart: ({ clientRect, command }) => {
          if (!clientRect) {
            return
          }

          getRectFnc.value = clientRect as () => ClientRectObject
          mentionEl.value?.show()
          selectFnc.value = command
        },
        onKeyDown: ({ event }) => {
          mentionEl.value?.onKeyDown(event)

          return true
        },
        onExit: () => {
          mentionEl.value?.hide()
        },
      }
    },
  },
})

// EDITOR
const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: { levels: [4, 5, 6] },
    }),
    PlaceholderExt,
    TextAlignExt,
    Underline,
    TextStyle,
    ColorExt,
    MentionExt,
  ],
  editable: !props.readonly && !props.disabled,
  editorProps: {
    attributes: {
      class: 'wysiwyg',
    },
  },
  onUpdate: ({ editor }) => {
    const text = editor.getText()

    if (text.length) {
      model.value = editor.getHTML()
    } else {
      model.value = props.emptyValue
    }
  },
  onFocus() {
    isFocused.value = true
  },
  onBlur() {
    isFocused.value = false
  },
})

// Editor commands
function handleToggleBold() {
  editor.value?.chain().focus().toggleBold().run()
}

function handleToggleUnderline() {
  editor.value?.chain().focus().toggleUnderline().run()
}

function handleToggleItalic() {
  editor.value?.chain().focus().toggleItalic().run()
}

function handleTextAlign(align: string) {
  editor.value?.chain().focus().setTextAlign(align).run()
}

function handleSetHeading(payload: { isHeading: boolean; level?: number }) {
  const { isHeading, level } = payload

  if (isHeading) {
    editor.value
      ?.chain()
      .focus()
      .setHeading({ level: (level as any) ?? 6 })
      .run()
  } else {
    editor.value?.chain().focus().setParagraph().run()
  }
}

function handleToggleBullettedList() {
  editor.value?.chain().focus().toggleBulletList().run()
}

function handleToggleNumberedList() {
  editor.value?.chain().focus().toggleOrderedList().run()
}

function handleSetColor(color?: string) {
  color
    ? editor.value?.chain().focus().setColor(color).run()
    : editor.value?.chain().focus().unsetColor().run()
}

watch(model, model => {
  if (!isFocused.value) {
    editor.value
      ?.chain()
      .setContent(model ?? '')
      .run()
  }
})
</script>

<template>
  <InputWrapper
    v-bind="wrapperProps"
    :has-content="!!modelValue"
    class="relative h-full"
    :content-class="[contentClass, '!items-start', 'h-full']"
    @mousedown="editor?.commands.focus()"
  >
    <EditorContent
      class="control"
      :editor="editor"
    />

    <WysiwygMention
      ref="mentionEl"
      :get-rect="getRectFnc"
      :select-fnc="selectFnc"
      :items="mentionItemsFiltered"
    />

    <template #menu>
      <Transition
        appear
        enter-active-class="animate-fade-in animate-duration-150"
        leave-active-class="animate-fade-out animate-duration-150"
      >
        <WysiwygSink
          v-if="
            (isFocused || sinkAlwaysVisible) && editor && !readonly && !disabled
          "
          :editor="editor"
          class="wysiwyg-sink"
          @toggle-bold="handleToggleBold"
          @toggle-italic="handleToggleItalic"
          @toggle-underline="handleToggleUnderline"
          @text-align="handleTextAlign"
          @set-heading="handleSetHeading"
          @toggle-bulleted-list="handleToggleBullettedList"
          @toggle-numbered-list="handleToggleNumberedList"
          @text-color="handleSetColor"
        />
      </Transition>
    </template>
  </InputWrapper>
</template>

<style lang="scss" scoped>
.control {
  --apply: w-full;
}

.wysiwyg {
  &-sink {
    --apply: absolute -top-40px right-0 w-full;
  }
}

:deep(.wysiwyg) {
  --apply: outline-none w-full min-h-inherit;

  p.is-empty:first-child::before {
    content: attr(data-placeholder);

    --apply: color-gray-500 dark:color-gray-400 float-left h-0 pointer-events-none;
  }

  [data-type="mention"] {
    --apply: italic;
  }
}
</style>
