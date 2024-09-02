import { DetailsSummary, type DetailsSummaryOptions } from '@tiptap-pro/extension-details-summary'

/**
 * Details Summary https://tiptap.dev/docs/editor/api/nodes/details-summary
 */
export function WysiwygDetailsSummary(
  options?: Partial<DetailsSummaryOptions>,
) {
  return DetailsSummary.configure({
    ...options,
  })
}
