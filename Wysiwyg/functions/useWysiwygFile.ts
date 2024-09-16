import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { mergeAttributes, Node } from '@tiptap/core'
import { FileHandler } from '@tiptap-pro/extension-file-handler'

// Models
import { FileModel } from '~/components/FileInput/models/file.model'

// Injections
import { useWysiwygInjections } from '~/components/Wysiwyg/functions/useWysiwygInjections'

// Store
import { useWysiwygStore } from '~/components/Wysiwyg/wysiwyg.store'

// Components
import WysiwygFileComponent from '~/components/Wysiwyg/WysiwygFile.vue'

/**
 * Creates the `wysiwyg-file` extension
 */
function WysiwygFile() {
  return Node.create({
    name: 'wysiwygFile',
    group: 'inline',
    inline: true, // Ensure the node is inline
    draggable: true,
    // atom: true,

    parseHTML() {
      return [{ tag: 'span[data-type="wysiwyg-file"]' }]
    },

    renderHTML({ HTMLAttributes }) {
      return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'wysiwyg-file' })]
    },

    addAttributes() {
      return {
        uuid: {
          default: '',
        },
        filepath: {
          default: '',
        },
      }
    },
    addNodeView() {
      return VueNodeViewRenderer(WysiwygFileComponent)
    },
  })
}

export function useWysiwygFile() {
  // Store
  const wysiwygStore = useWysiwygStore()

  const FileHandlerExt = FileHandler.configure({
    onDrop: (_, files, pos) => {
      const droppedFiles = files.map(file => new FileModel({ file }))

      addFiles(droppedFiles, pos)
    },
    onPaste: (_, files) => {
      const pastedFiles = files.map(file => new FileModel({ file }))

      addFiles(pastedFiles)
    },
  })

  /**
   * Handles the uploading of files in the editor
   */
  function addFiles(files: FileModel[] | IFile[], pos?: number) {
    const editor = wysiwygStore.editor

    files.forEach(file => {
      const uuid = generateUUID()
      const isFileModel = file instanceof FileModel
      wysiwygStore.providedData[uuid] = { file }

      /**
       * In case we're just inserting files that already exist (~ are already uploaded),
       * we just put them into the editor and provide them to the `wysiwyg-file` extension
       */
      if (!isFileModel) {
        editor
          ?.chain()
          .focus()
          .insertContent(`<span uuid="${uuid}" filepath="${file.path}" data-type="wysiwyg-file" />`)
          .run()
      }

      // Othwerwise, we upload the files and then do the same as above
      else {
        // If the files are added through D'n'D, insert them at the cursor position
        if (!isNil(pos)) {
          editor
            ?.chain()
            .focus()
            .insertContentAt(pos, `<span uuid="${uuid}" data-type="wysiwyg-file" />`)
            .run()
        }

        // Otherwise, insert the files at the current location in editor
        else {
          editor
            ?.chain()
            .focus()
            .insertContent(`<span uuid="${uuid}" data-type="wysiwyg-file" />`)
            .run()
        }
      }
    })
  }

  useWysiwygInjections({ addFiles })

  return {
    FileHandler: FileHandlerExt,
    addFiles,
    WysiwygFile,
  }
}
