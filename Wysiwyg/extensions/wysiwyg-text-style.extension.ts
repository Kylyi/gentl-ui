import TextStyle, { type TextStyleOptions } from '@tiptap/extension-text-style'

/**
 * TextStyle https://tiptap.dev/api/extensions/text-style
 */
export function WysiwygTextStyle(options?: Partial<TextStyleOptions>) {
  return TextStyle.configure({
    ...options,
  })
}
