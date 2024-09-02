import Color, { type ColorOptions } from '@tiptap/extension-color'

/**
 * Color https://tiptap.dev/api/extensions/color
 */
export function WysiwygColor(options?: Partial<ColorOptions>) {
  return Color.configure({
    types: ['textStyle'],

    ...options,
  })
}
