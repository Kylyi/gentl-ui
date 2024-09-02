import { Image, type ImageOptions } from '@tiptap/extension-image'

/**
 * Image https://tiptap.dev/api/extensions/image
 */
export function WysiwygImage(
  options?: Partial<ImageOptions>,
) {
  return Image.configure({
    allowBase64: true,

    ...options,
  })
}
