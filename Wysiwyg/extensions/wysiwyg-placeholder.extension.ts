import Placeholder, { type PlaceholderOptions } from '@tiptap/extension-placeholder'

// Types
import type { IWysiwygProps } from '~/components/Wysiwyg/types/wysiwyg-props.type'

/**
 * Placeholder https://tiptap.dev/api/extensions/placeholder
 */
export function WysiwygPlaceholder(
  props: Pick<IWysiwygProps, 'placeholder'>,
  options?: Partial<PlaceholderOptions>,
) {
  return Placeholder.configure({
    placeholder: () => props.placeholder || '',
    emptyNodeClass: 'is-empty',

    ...options,
  })
}
