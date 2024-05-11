import type { CSSProperties } from 'vue'
import { type ImageOptions } from '@tiptap/extension-image'

// TYPES
import type { IInputWrapperProps } from '~/components/Inputs/types/input-wrapper-props.type'
import type { IWysiwygMentionItem } from '~/components/Wysiwyg/types/wysiwyg-mention-item.type'

export interface IWysiwygProps extends IInputWrapperProps {
  allowLink?: boolean
  image?: Partial<ImageOptions>
  debounce?: number
  editorClass?: ClassType
  editorStyle?: CSSProperties
  emptyValue?: any
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
   * When true, the editor will replace the mention with whatever value it finds
   * This will override the mention value!
   */
  mentionReplace?: boolean

}
