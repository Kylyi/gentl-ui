import Underline, { type UnderlineOptions } from '@tiptap/extension-underline'

/**
 * Underline https://tiptap.dev/api/extensions/underline
 */
export function WysiwygUnderline(
  options?: Partial<UnderlineOptions>,
) {
  return Underline.configure({
    ...options,
  })
}
