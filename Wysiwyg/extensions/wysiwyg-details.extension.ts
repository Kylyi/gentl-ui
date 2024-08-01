import { Details, type DetailsOptions } from '@tiptap-pro/extension-details'

/**
 * Details https://tiptap.dev/docs/editor/api/nodes/details
 */
export function WysiwygDetails(
  options?: Partial<DetailsOptions>,
) {
  return Details.configure({
    persist: true,
    HTMLAttributes: { class: 'details' },

    ...options,
  })
}
