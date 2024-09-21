import type { FocusOptions } from '@tiptap/extension-focus'
import Focus from '@tiptap/extension-focus'

/**
 * UniqueID https://tiptap.dev/docs/editor/extensions/functionality/uniqueid
 */
export function WysiwygFocus(options?: Partial<FocusOptions>) {
  return Focus.configure({
    mode: 'deepest',

    ...options,
  })
}
