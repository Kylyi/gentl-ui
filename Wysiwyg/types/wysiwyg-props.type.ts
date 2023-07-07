import { ImageOptions } from '@tiptap/extension-image'

// TYPES
import type { IWysiwygMentionItem } from '~/components/Wysiwyg/types/wysiwyg-mention-item.type'
import type { IInputWrapperProps } from '~~/components/Inputs/types/input-wrapper-props.type'

export interface IWysiwygProps extends IInputWrapperProps {
  image?: Partial<ImageOptions>
  debounce?: number
  emptyValue?: any
  hint?: string
  name?: string
  noSink?: boolean
  mentionItems?: IWysiwygMentionItem[]
  modelValue?: any
  sinkAlwaysVisible?: boolean
}
