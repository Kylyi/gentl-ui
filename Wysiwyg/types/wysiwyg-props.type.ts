import type { CSSProperties } from 'vue'
import type { ImageOptions } from '@tiptap/extension-image'

// Types
import type { IInputWrapperProps } from '~/components/Inputs/types/input-wrapper-props.type'
import type { IWysiwygMentionItem } from '~/components/Wysiwyg/types/wysiwyg-mention-item.type'
import type { IWysiwygMentionSetup } from '~/components/Wysiwyg/types/wysiwyg-mention-setup.type'

export type IWysiwygProps = {
  /**
   * When true, images will be allowed to be inserted
   *
   * TODO: This is not yet implemented
   */
  allowImage?: boolean

  /**
   * When true, links will be allowed to be inserted
   */
  allowLink?: boolean

  /**
   * When true, files will be allowed to be inserted
   */
  allowFileUpload?: boolean
  image?: Partial<ImageOptions> | boolean
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

  mentionSetup?: IWysiwygMentionSetup[]

  /**
   * When true, the WysiwygSink will NOT be floating -> will be `relative` instead of `absolute`
   */
  noSinkFloat?: boolean

  /**
   * When true, the editor will automatically resolve mentions as the user types
   * So there will be no {{mention}} in the editor, it will just resolve to the value
   * It will not override the mentions though!
   */
  mentionResolve?: boolean

  /**
   * The files that are part of the editor
   */
  files?: IFile[] | null

  /**
   * When true, the editor will replace the mention with whatever value it finds
   * This will override the mention value!
   */
  mentionReplace?: boolean

  /**
   * The format of the returned value
   */
  returnFormat?: 'html' | 'markdown'

  /**
   * The function to use for resolving the mention
   *
   * Usage:
   *  - Let's say we prepare a Wysiwyg with some fields like `name`, `city` and `country`
   *  - We then need to populate the mention with the value of given field within some context
   *
   * We would have something like this:
   *
   * data: {
   *   user: {
   *     name: 'John Doe',
   *   }
   * }
   *
   * mentionSetup: {
   *   char: '@',
   *   loadData: ({ search }) => [{ id: 'user.name', label: 'Name }]
   * }
   *
   * populateMention: (id) => {
   *   return get(data, id)
   * }
   */
  populateMention?: (id: string | number) => string

  /**
   * Injected function that will be called when the mention is resolved
   */
  onMentionResolve?: (html: string) => void

} & IInputWrapperProps
