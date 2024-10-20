import type { CSSProperties } from 'vue'
import type { ImageOptions } from '@tiptap/extension-image'

// Types
import type { IInputWrapperProps } from '~/components/Inputs/types/input-wrapper-props.type'
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
   * When true, email buttons will be allowed to be inserted
   */
  allowEmailBtn?: boolean

  /**
   * When true, files will be allowed to be inserted
   */
  allowFileUpload?: boolean

  /**
   * When true, tables will be allowed to be inserted
   */
  allowTable?: boolean

  /**
   *
   */
  image?: Partial<ImageOptions> | boolean

  /**
   * Debounce for changes within the editor
   */
  debounce?: number

  /**
   * Class for the editor
   */
  editorClass?: ClassType

  /**
   * Style for the editor
   */
  editorStyle?: CSSProperties

  /**
   * The empty value
   */
  emptyValue?: any

  /**
   * Hint for the wysiwyg editor
   */
  hint?: string

  /**
   * Name for the wysiwyg editor
   */
  name?: string
  modelValue?: any

  /**
   * Mentions
   */
  mentionSetup?: IWysiwygMentionSetup[]

  /**
   * When true, the WysiwygSink will NOT be shown
   */
  noSink?: boolean

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
  returnFormat?: 'html' | 'markdown' | 'text'

  /**
   * When true, the sink will always be visible
   */
  sinkAlwaysVisible?: boolean

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
