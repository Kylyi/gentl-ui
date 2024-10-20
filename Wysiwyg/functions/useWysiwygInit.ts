import { useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

// Types
import { Markdown } from 'tiptap-markdown'
import type { IWysiwygProps } from '~/components/Wysiwyg/types/wysiwyg-props.type'

// Functions
import { useWysiwygFile } from '~/components/Wysiwyg/functions/useWysiwygFile'
import { useWysiwygMention } from '~/components/Wysiwyg/functions/useWysiwygMention'

// Store
import { useWysiwygStore } from '~/components/Wysiwyg/wysiwyg.store'

// Extensions
import { WysiwygPlaceholder } from '~/components/Wysiwyg/extensions/wysiwyg-placeholder.extension'
import { WysiwygTextAlign } from '~/components/Wysiwyg/extensions/wysiwyg-text-align.extension'
import { WysiwygUnderline } from '~/components/Wysiwyg/extensions/wysiwyg-underline.extension'
import { WysiwygTextStyle } from '~/components/Wysiwyg/extensions/wysiwyg-text-style.extension'
import { WysiwygColor } from '~/components/Wysiwyg/extensions/wysiwyg-color.extension'
import { WysiwygDetails } from '~/components/Wysiwyg/extensions/wysiwyg-details.extension'
import { WysiwygDetailsSummary } from '~/components/Wysiwyg/extensions/wysiwyg-details-summary.extension'
import { WysiwygDetailsContent } from '~/components/Wysiwyg/extensions/wysiwyg-details-content.extension'
import { WysiwygTaskList } from '~/components/Wysiwyg/extensions/wysiwyg-task-list.extension'
import { WysiwygTaskItem } from '~/components/Wysiwyg/extensions/wysiwyg-task-item.extension'
import { WysiwygImage } from '~/components/Wysiwyg/extensions/wysiwyg-image.extension'
import { WysiwygLink } from '~/components/Wysiwyg/extensions/wysiwyg-link.extension'
import { useWysiwygCodeBlock } from '~/components/Wysiwyg/functions/useWysiwygCodeBlock'
import { WysiwygFocus } from '~/components/Wysiwyg/extensions/wysiwyg-focus.extension'
import { useWysiwygEmailBtn } from '~/components/Wysiwyg/functions/useWysiwygEmailBtn'
import { WysiwygTable } from '~/components/Wysiwyg/extensions/wysiwyg-table.extension'

export function useWysiwygInit(
  props: IWysiwygProps,
  model: Ref<any>,
) {
  // Utils
  const self = getCurrentInstance()
  const { WysiwygFile, FileHandler } = useWysiwygFile()
  const { WysiwygCodeBlock } = useWysiwygCodeBlock()
  const { WysiwygEmailBtn } = useWysiwygEmailBtn()
  const {
    getRect,
    loadData,
    listProps,
    selectFnc,
    mentionEl,
    MentionExtensions,
  } = useWysiwygMention(props)

  function resolveExtension<T>(
    extension: T,
    dependentKey: keyof IWysiwygProps,
  ) {
    const extensions = Array.isArray(extension)
      ? extension
      : [extension]

    return props[dependentKey] ? extensions : []
  }

  // Store
  const wysiwygStore = useWysiwygStore()

  // Layout
  const isEditable = computed(() => !props.readonly && !props.disabled)

  // Editor
  const editor = useEditor({
    content: props.modelValue,
    editable: isEditable.value,
    editorProps: {
      attributes: { class: 'wysiwyg' },
      handleKeyDown: (_, event) => {
        const isCtrl = event.ctrlKey || event.metaKey

        // Custom handling of the `CTRL + Enter`
        if (isCtrl && event.key === 'Enter') {
          self?.emit('submit')

          return true
        }
      },
    },
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      WysiwygFocus(),
      Markdown.configure({ breaks: true }),
      WysiwygCodeBlock(),
      WysiwygPlaceholder(props),
      WysiwygTextAlign(),
      WysiwygUnderline(),
      WysiwygTextStyle(),
      WysiwygColor(),
      WysiwygDetails(),
      WysiwygDetailsSummary(),
      WysiwygDetailsContent(),
      WysiwygTaskList(),
      WysiwygTaskItem(),

      // Table
      ...resolveExtension(WysiwygTable(), 'allowTable'),

      // File upload
      ...resolveExtension(WysiwygFile(), 'allowFileUpload'),
      ...resolveExtension(FileHandler, 'allowFileUpload'),

      // Images
      ...resolveExtension(WysiwygImage(), 'allowImage'),

      // Email button
      ...resolveExtension(WysiwygEmailBtn(), 'allowEmailBtn'),

      // Link
      ...resolveExtension(WysiwygLink(), 'allowLink'),

      // Mentions
      ...MentionExtensions,
    ],

    onUpdate: ({ editor }) => {
      const text = editor.getText()

      if (text.length) {
        model.value = wysiwygStore.getEditorValue?.()
      } else {
        model.value = props.emptyValue
      }
    },
    onFocus: () => {
      wysiwygStore.isFocused = true

      self?.emit('focus')
    },
    onBlur: () => {
      wysiwygStore.isFocused = false

      self?.emit('blur')
    },
  })

  // Get editor value
  wysiwygStore.getEditorValue = () => {
    const returnFormat = props.returnFormat ?? 'html'

    switch (returnFormat) {
      case 'html':
        return editor.value?.getHTML()

      case 'markdown':
        return editor.value?.storage.markdown.getMarkdown()

      case 'text':
        return editor.value?.getText()
    }
  }

  // Provide
  watchOnce(editor, editor => {
    if (editor) {
      wysiwygStore.setEditor(editor)
    }
  })

  // React to editability
  watch(isEditable, isEditable => {
    editor.value?.setEditable(isEditable)
  })

  return {
    editor,
    mentionEl,
    getRect,
    loadMentionData: loadData,
    mentionListProps: listProps,
    selectFnc,
  }
}
