import { useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

// Types
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

export function useWysiwygInit(
  props: IWysiwygProps,
  model: Ref<any>,
) {
  // Utils
  const self = getCurrentInstance()
  const { WysiwygFile, FileHandler } = useWysiwygFile()
  const {
    getRect,
    loadData,
    selectFnc,
    mentionEl,
    MentionExtensions,
  } = useWysiwygMention(props)

  function resolveExtension<T>(
    extension: T,
    dependentKey: keyof IWysiwygProps,
  ) {
    return props[dependentKey] ? [extension] : []
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
      StarterKit,
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

      // File upload
      ...resolveExtension(WysiwygFile(), 'allowFileUpload'),
      ...resolveExtension(FileHandler, 'allowFileUpload'),

      // Images
      ...resolveExtension(WysiwygImage(), 'allowImage'),

      // Link
      ...resolveExtension(WysiwygLink(), 'allowLink'),

      ...MentionExtensions,
    ],
    onUpdate: ({ editor }) => {
      const text = editor.getText()

      if (text.length) {
        model.value = editor.getHTML()
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
    selectFnc,
  }
}
