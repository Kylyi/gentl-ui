import type { ShallowRef } from 'vue'
import type { Editor } from '@tiptap/vue-3'

export function useWysiwygInjections(options?: {
  editor?: ShallowRef<Editor | undefined>
  filesByPath?: ComputedRef<Record<IFile['path'], Pick<IFile, 'id' | 'path' | 'name'>> | undefined>
  // mentionItems?: Ref<IWysiwygMentionItem[]>
  // mentionEntity?: Ref<IItem>
  providedData?: IItem
  addFiles?: (files: File[], ev?: MouseEvent) => void
  removeElement?: (element: HTMLElement | null) => void
  syncFilesHTML: () => void
}) {
  const {
    editor,
    filesByPath,
    // mentionItems,
    // mentionEntity,
    providedData,
    addFiles,
    removeElement,
    syncFilesHTML,
  } = options ?? {}

  const wysiwygEditor = editor || injectLocal('wysiwygEditor', ref(null))
  const wysiwygFilesByPath = filesByPath || injectLocal('wysiwygFilesByPath', ref({}))
  // const wysiwygMentionItems = mentionItems || injectLocal('wysiwygMentionItems', ref([]))
  // const wysiwygMentionEntity = mentionEntity || injectLocal('wysiwygMentionEntity', ref(providedData))
  const wysiwygProvidedData = providedData || injectLocal('wysiwygProvidedData', {} as IItem)
  const wysiwygAddFiles = addFiles || injectLocal('wysiwygAddFiles', () => {})
  const wysiwygRemoveElement = removeElement || injectLocal('wysiwygRemoveElement', () => {})
  const wysiwygSyncFilesHTML = syncFilesHTML || injectLocal('wysiwygSyncFilesHTML', () => {})

  provideLocal('wysiwygEditor', wysiwygEditor)
  provideLocal('wysiwygFilesByPath', wysiwygFilesByPath)
  // provideLocal('wysiwygMentionItems', wysiwygMentionItems)
  // provideLocal('wysiwygMentionEntity', wysiwygMentionEntity)
  provideLocal('wysiwygProvidedData', wysiwygProvidedData)
  provideLocal('wysiwygAddFiles', wysiwygAddFiles)
  provideLocal('wysiwygRemoveElement', wysiwygRemoveElement)
  provideLocal('wysiwygSyncFilesHTML', wysiwygSyncFilesHTML)

  return {
    wysiwygEditor,
    wysiwygFilesByPath,
    // wysiwygMentionItems,
    // wysiwygMentionEntity,
    wysiwygProvidedData,
    wysiwygAddFiles,
    wysiwygRemoveElement,
    wysiwygSyncFilesHTML,
  }
}
