import { TextAlign, type TextAlignOptions } from '@tiptap/extension-text-align'

/**
 * TextAlign https://tiptap.dev/api/extensions/text-align
 */
export function WysiwygTextAlign(
  options?: Partial<TextAlignOptions>,
) {
  return TextAlign.configure({
    types: ['paragraph', 'heading'],

    ...options,
  })
}
