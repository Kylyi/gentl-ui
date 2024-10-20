import type { Editor } from '@tiptap/vue-3'

// Types
import type { IWysiwygMentionSetup } from '~/components/Wysiwyg/types/wysiwyg-mention-setup.type'

// Injections
import { wysiwygIdKey } from '~/components/Wysiwyg/provide/wysiwyg.provide'

export function useWysiwygStore(wysiwygId?: string) {
  const _wysiwygId = injectLocal(wysiwygIdKey, wysiwygId ?? useId())

  return defineStore(`wysiwyg.${_wysiwygId}`, () => {
    const editor = shallowRef<Editor>()
    const providedData = reactive<IItem>({})
    const files = ref<IFile[]>([])
    const isFocused = ref(false)
    const mentionSetup = ref<IWysiwygMentionSetup[] | undefined>()

    const getEditorValue = ref<() => any>()

    const filesByPath = computed(() => {
      return files.value.reduce((agg, file) => {
        if (file.path) {
          agg[file.path] = file
        }

        return agg
      }, {} as Record<string, IFile>)
    })

    function setEditor(_editor: Editor) {
      editor.value = _editor
    }

    return {
      editor,
      files,
      filesByPath,
      isFocused,
      mentionSetup,
      providedData,
      getEditorValue,
      setEditor,
    }
  })()
}
