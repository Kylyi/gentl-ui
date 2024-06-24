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
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Dropcursor } from '@tiptap/extension-dropcursor'
import { Details } from '@tiptap-pro/extension-details'
import { DetailsSummary } from '@tiptap-pro/extension-details-summary'
import { DetailsContent } from '@tiptap-pro/extension-details-content'
import { TaskItem } from '@tiptap/extension-task-item'
import { TaskList } from '@tiptap/extension-task-list'

// Types
import type { ClientRectObject } from '@floating-ui/vue'
import type { IWysiwygProps } from '~/components/Wysiwyg/types/wysiwyg-props.type'
import type { IWysiwygMentionItem } from '~/components/Wysiwyg/types/wysiwyg-mention-item.type'

// Models
import { FileModel } from '~/components/FileInput/models/file.model'

// Functions
import { useWysiwygUtils } from '~/components/Wysiwyg/functions/useWysiwygUtils'
import { useInputWrapperUtils } from '~/components/Inputs/functions/useInputWrapperUtils'

// Components
import WysiwygMention from '~/components/Wysiwyg/WysiwygMention.vue'
import WysiwygSink from '~/components/Wysiwyg/WysiwygSink.vue'

// Injections
import { mentionItemsKey } from '~/components/Wysiwyg/provide/wysiwyg.provide'
import { useWysiwygInjections } from '~/components/Wysiwyg/functions/useWysiwygInjections'

const props = withDefaults(defineProps<IWysiwygProps>(), {
  autoResolveFiles: true,
  errorVisible: true,
})

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'focus'): void
  (e: 'blur'): void
}>()

defineExpose({
  focus: focusEditor,
  blur: blurEditor,
  resolveValues: () => {
    if (editor.value) {
      resolveValues(editor.value.view)
    }
  },
})

// Utils
const { FileComponent, resolveValues } = useWysiwygUtils()
const { getInputWrapperProps } = useInputWrapperUtils()

// Layout
const editorEl = ref<any>()
const model = defineModel()
const isFocused = ref(false)
const hasActiveMenu = ref(false)
const providedData = reactive<IItem>({})

const mentionItems = injectStrict(mentionItemsKey, toRef(props, 'mentionItems'))

const transitionProps = computed(() => ({
  enterActiveClass: 'animate-fade-in animate-duration-150',
  leaveActiveClass: 'animate-fade-out animate-duration-150',
}))

const ui = computed(() => {
  return {
    ...props.ui,
    contentClass: [props.ui?.contentClass, 'selector-wrapper'],
  } as typeof props.ui
})

// Wrapper
const wrapperProps = getInputWrapperProps(props)

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

// Image https://tiptap.dev/api/extensions/image
const ImageExt = Image.configure(typeof props.image === 'boolean' ? {} : props.image)

// Link https://tiptap.dev/api/marks/link
const LinkExt = Link.extend({
  // @ts-expect-error Idk
  addKeyboardShortcuts() {
    return {
      ArrowRight: ({ editor }) => {
        if (!editor.isActive('link')) {
          return
        }

        const { from, to, $anchor } = editor.state.selection
        const transaction = editor.state.tr

        // Check if the cursor is at the end of the link
        if ($anchor && $anchor.nodeAfter && $anchor.nodeAfter.isText) {
          return
        }

        transaction.removeMark(from, to, editor.schema.marks.link)

        if ($anchor) {
          transaction.removeStoredMark(editor.schema.marks.link)
        }

        editor.view.dispatch(transaction)

        editor.chain().focus().insertContent(' ').run()

        return true
      },
    }
  },
}).configure({
  openOnClick: 'whenNotEditable',
  protocols: ['ftp', 'mailto'],
  HTMLAttributes: {
    class: 'link',
  },
})

// Dropcursor https://tiptap.dev/api/extensions/dropcursor
const DropcursorExt = Dropcursor.configure()

// Details https://tiptap.dev/docs/editor/api/nodes/details
const DetailsExt = Details.configure({ persist: true, HTMLAttributes: { class: 'details' } })

// Details Summary https://tiptap.dev/docs/editor/api/nodes/details-summary
const DetailsSummaryExt = DetailsSummary.configure({})

// Details Content https://tiptap.dev/docs/editor/api/nodes/details-content
const DetailsContentExt = DetailsContent.configure({})

// TaskList https://tiptap.dev/docs/editor/api/nodes/task-list
const TaskListExt = TaskList.configure({})

// TaskItem https://tiptap.dev/docs/editor/api/nodes/task-item
const TaskItemExt = TaskItem.configure({ nested: true })

// Mention https://tiptap.dev/api/nodes/mention
const mentionEl = ref<InstanceType<typeof WysiwygMention>>()
const selectFnc = ref<Function>(() => {})
const mentionItemsFiltered = ref<IWysiwygMentionItem[]>([])
const getRectFnc = ref<() => ClientRectObject>(() => ({
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
}))

const MentionExt = Mention.configure({
  renderLabel: ({ node, options }) => {
    return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}}}`
  },
  suggestion: {
    char: '{{',
    items: ({ query }) => {
      if (!query) {
        mentionItemsFiltered.value = toValue(mentionItems) || []
      }

      mentionItemsFiltered.value = (toValue(mentionItems) || []).filter(
        item => {
          return item.label.toLowerCase().startsWith(query.toLowerCase())
        },
      )

      return []
    },
    render: () => {
      return {
        onStart: ({ clientRect, command }) => {
          if (!clientRect || !isFocused.value) {
            return
          }

          getRectFnc.value = clientRect as () => ClientRectObject
          mentionEl.value?.show()
          selectFnc.value = command
        },
        onKeyDown: ({ event, view }) => {
          mentionEl.value?.onKeyDown(event)

          if (event.key === 'Enter' && props.autoResolveMentions) {
            nextTick(() => resolveValues(view))
          }

          return event.key !== 'Escape' && event.key !== 'Backspace'
        },
        onExit: () => {
          mentionEl.value?.hide()
        },
      }
    },
  },
})

// Editor
const sinkEl = ref<InstanceType<typeof WysiwygSink>>()
const editor = useEditor({
  content: props.modelValue,
  extensions: [
    // Extensions
    StarterKit,
    PlaceholderExt,
    TextAlignExt,
    Underline,
    TextStyle,
    ColorExt,
    DropcursorExt,
    DetailsExt,
    DetailsSummaryExt,
    DetailsContentExt,
    TaskListExt,
    TaskItemExt,
    ...(toValue(mentionItems) ? [MentionExt] : []),
    ...(props.fileUpload ? [FileComponent()] : []),
    ...(props.image ? [ImageExt] : []),
    ...(props.allowLink ? [LinkExt] : []),
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

    emits('focus')
  },
  onBlur() {
    isFocused.value = false

    emits('blur')
  },
})

useMutationObserver(
  sinkEl,
  records => {
    hasActiveMenu.value = records.some(record => {
      const targetClasslist = (record.target as HTMLElement).classList

      return targetClasslist.contains('is-menu-active') || targetClasslist.contains('is-dialog-active')
    })
  },
  { subtree: true, attributeFilter: ['class'] },
)

function blurEditor() {
  editor.value?.commands.blur()
}

function removeElement(selector: string) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(editor.value?.getHTML() ?? '', 'text/html')

  const node = doc.querySelector(selector)

  if (node) {
    node.remove()

    editor.value?.chain().setContent(doc.body.innerHTML).run()
    model.value = doc.body.innerHTML
  }
}

const isSinkVisible = computed(() => {
  const isEditable = !props.readonly && !props.disabled

  return (isFocused.value || props.sinkAlwaysVisible || hasActiveMenu.value)
    && isEditable
    && !props.noSink
})

// Uploaded files that the Wysiwyg must have access to, by their path
const filesByPath = computed(() => {
  return props.files?.reduce((agg, file) => {
    agg[file.path] = file

    return agg
  }, {} as Record<IFile['path'], Pick<IFile, 'id' | 'path' | 'name'>>)
})

function handleUploadFiles(files: File[] | IFile[], dropEvent?: MouseEvent) {
  const isExistingFiles = 'id' in files[0]

  if (isExistingFiles) {
    files.forEach(file => {
      const uuid = generateUUID()
      const _file = file as IFile
      providedData[uuid] = { file: _file }

      editor.value?.chain().focus()
        .insertContent(`<span uuid="${uuid}" filepath="${_file.path}" data-type="wysiwyg-file" />`)
        .run()
    })
  } else {
    const _files = files.map(file => new FileModel({ file: file as File }))

    _files.forEach(file => {
      const uuid = generateUUID()
      providedData[uuid] = { file }

      // If the files are added through D'n'D, insert them at the cursor position
      if (dropEvent) {
        const pos = editor.value?.view.posAtCoords({
          left: dropEvent.clientX,
          top: dropEvent.clientY,
        })

        if (pos) {
          editor.value?.chain().focus()
            .insertContentAt(pos.pos, `<span uuid="${uuid}" data-type="wysiwyg-file" />`)
            .run()
        }
      }

      // Otherwise, insert the files at the current location in editor
      else {
        editor.value?.chain().focus()
          .insertContent(`<span uuid="${uuid}" data-type="wysiwyg-file" />`)
          .run()
      }
    })
  }
}

/**
 * Once files are uploaded, its path needs to be updated in the editor,
 * this method does exactly that
 */
function syncFilesHTML() {
  if (!editor.value) {
    return ''
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(editor.value?.getHTML(), 'text/html')

  const fileNodes = doc.querySelectorAll('[data-type="wysiwyg-file"]')

  Array.from(fileNodes).forEach(node => {
    const nodeUUID = node.getAttribute('uuid') ?? ''

    const file = providedData[nodeUUID]?.file as FileModel
    const filepath = file?.uploadedFile?.filepath

    if (filepath) {
      node.setAttribute('filepath', filepath)
    }
  })

  model.value = doc.body.innerHTML
  editor.value?.chain().setContent(doc.body.innerHTML).run()
}

// Editor commands
function focusEditor() {
  if (!editor.value?.isFocused) {
    editor.value?.chain().focus().run()
  }
}

// Watch model to update editor content (only if not focused)
watch(model, model => {
  if (!isFocused.value) {
    editor.value?.chain().setContent(model ?? '').run()
  }
})

// Watch readonly prop and set editor editable
watch(
  () => props.readonly,
  isReadonly => {
    editor.value?.setEditable(!isReadonly)
  },
)

useWysiwygInjections({
  editor,
  filesByPath,
  providedData,
  addFiles: handleUploadFiles,
  removeElement,
  syncFilesHTML,
})

onMounted(() => {
  nextTick(() => {
    if (props.mentionReplace && editor.value) {
      resolveValues(editor.value.view)
    }

    // Handle files drop
    editor.value?.view.dom.addEventListener('drop', event => {
      event.preventDefault()

      const droppedFiles = Array.from(event.dataTransfer?.files || [])

      if (droppedFiles.length) {
        handleUploadFiles(droppedFiles, event)
      }
    })
  })
})
</script>

<template>
  <InputWrapper
    v-bind="wrapperProps"
    :has-content="!!modelValue"
    class="relative"
    :ui="ui"
    @mousedown="focusEditor"
  >
    <EditorContent
      ref="editorEl"
      class="control"
      :editor="editor"
      min-h="50"
      :class="editorClass"
      :style="editorStyle"
      @drop.stop.prevent
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
        v-bind="transitionProps"
      >
        <WysiwygSink
          v-if="isSinkVisible && editor"
          ref="sinkEl"
          class="wysiwyg-sink"
          :class="{ 'is-floating': !noSinkFloat }"
          :allow-link="allowLink"
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
.control {
  @apply: w-full;
}

.wysiwyg {
  &-sink {
    @apply: right-0 w-full shrink-0;

    &.is-floating {
      @apply absolute -top-40px;
    }
  }
}

:deep(.wysiwyg) {
  @apply: outline-none fit;

  p.is-empty:first-child::before {
    content: attr(data-placeholder);

    @apply: color-gray-500 dark: color-gray-400 float-left h-0
      pointer-events-none;
  }

  [data-type='mention'] {
    @apply: italic;
  }
}

:deep(.ProseMirror-selectednode) {
  @apply outline-2 outline-solid outline-primary rounded-custom;
}

:deep([data-type='details']) {
  @apply flex border-1 border-ca rounded-custom p-2;
  list-style: none;

  > button {
    @apply relative h-6 w-6 cursor-pointer;

    &::before {
      @apply absolute flex flex-center leading-none top-1 left-2px font-rem-20;
      content: '\25B6';
    }
  }

  &.is-open > button::before {
    @apply rotate-90;
  }

  > div {
    flex: 1 1 auto;
  }

  :last-child {
    margin-bottom: 0;
  }
}

:deep(ul[data-type='taskList']) {
  list-style: none;
  padding: 0;

  p {
    margin: 0;
  }

  li {
    @apply flex;

    > label {
      @apply shrink-0 select-none m-r-2 m-t-2px;

      input {
        @apply min-w-4;
      }
    }

    > div {
      flex: 1 1 auto;
    }

    ul li,
    ol li {
      display: list-item;
    }

    ul[data-type='taskList'] > li {
      display: flex;
    }
  }
}
</style>
