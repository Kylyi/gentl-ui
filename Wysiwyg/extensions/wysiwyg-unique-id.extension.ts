import { UniqueID, type UniqueIDOptions } from '@tiptap-pro/extension-unique-id'

/**
 * UniqueID https://tiptap.dev/docs/editor/extensions/functionality/uniqueid
 */
export function WysiwygUniqueId(options?: Partial<UniqueIDOptions>) {
  return UniqueID.configure({

    ...options,
  })
}
