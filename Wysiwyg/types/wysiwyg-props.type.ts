import type { CSSProperties } from 'vue'
import { type ImageOptions } from '@tiptap/extension-image'

// Types
import type { IInputWrapperProps } from '~/components/Inputs/types/input-wrapper-props.type'
import type { IWysiwygMentionItem } from '~/components/Wysiwyg/types/wysiwyg-mention-item.type'

type IFile = {
  id: string | number
  name: string
  path: string
}

export interface IWysiwygProps extends IInputWrapperProps {
  allowLink?: boolean
  image?: Partial<ImageOptions> | boolean
  debounce?: number
  editorClass?: ClassType
  editorStyle?: CSSProperties
  emptyValue?: any
  fileUpload?: boolean
  hint?: string
  name?: string
  noSink?: boolean
  mentionItems?: IWysiwygMentionItem[]
  modelValue?: any
  sinkAlwaysVisible?: boolean

  /**
   * When true, the editor will automatically resolve mentions as the user types
   * So there will be no {{mention}} in the editor, it will just resolve to the value
   * It will not override the mentions though!
   */
  autoResolveMentions?: boolean

  /**
   * When true, editor will automatically upload the files and adjust the html
   */
  autoResolveFiles?: boolean

  /**
   * The files that are part of the editor
   */
  files?: Array<Pick<IFile, 'id' | 'name' | 'path'>> | null

  /**
   * When true, the editor will replace the mention with whatever value it finds
   * This will override the mention value!
   */
  mentionReplace?: boolean

}
