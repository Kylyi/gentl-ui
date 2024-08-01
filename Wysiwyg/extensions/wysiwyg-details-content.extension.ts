import DetailsContent, { type DetailsContentOptions } from '@tiptap-pro/extension-details-content'

/**
 * Details Content https://tiptap.dev/docs/editor/api/nodes/details-content
 */
export function WysiwygDetailsContent(
  options?: Partial<DetailsContentOptions>,
) {
  return DetailsContent.configure({
    ...options,
  })
}
