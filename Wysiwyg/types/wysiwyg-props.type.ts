import type { ImageOptions } from '@tiptap/extension-image'
import type { CSSProperties } from 'vue'

// Types
import type { IInputWrapperProps } from '~/components/Inputs/types/input-wrapper-props.type'
import type { IWysiwygFeaturesProps } from '~/components/Wysiwyg/types/wysiwyg-features-props.type'
import type { IWysiwygMentionSetup } from '~/components/Wysiwyg/types/wysiwyg-mention-setup.type'
import type { IWysiwygSinkProps } from '~/components/Wysiwyg/types/wysiwyg-sink-props.type'

type WysiwygFeaturePreset = 'full' | 'none' | 'basic'

export type IWysiwygProps = IInputWrapperProps & {
  /**
   *
   */
  image?: Partial<ImageOptions> | boolean

  /**
   * Debounce for changes within the editor
   */
  debounce?: number

  /**
   * Whether to show the edit dialog
   */
  editDialog?: boolean

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

  features?: IWysiwygFeaturesProps | WysiwygFeaturePreset

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

  sink?: IWysiwygSinkProps | boolean

  /**
   * Visuals (CSS) for each node (and some marks)
   */
  visuals?: Record<string, CSSProperties & IItem>

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

}
