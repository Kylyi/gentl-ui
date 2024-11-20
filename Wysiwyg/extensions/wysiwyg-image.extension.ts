import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { Image, type ImageOptions } from '@tiptap/extension-image'

// Components
import WysiwygImg from '~/components/Wysiwyg/WysiwygImg.vue'

/**
 * Image https://tiptap.dev/api/extensions/image
 */
export function WysiwygImage(
  options?: Partial<ImageOptions>,
) {
  return Image
    .configure({
      allowBase64: true,

      ...options,
    })
    .extend({
      addNodeView() {
        // @ts-expect-error
        return VueNodeViewRenderer(WysiwygImg)
      },
    })
}
