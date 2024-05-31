// Types
import type { IItem } from '~/libs/Shared/types/item.type'
import type { IWysiwygMentionItem } from '~/components/Wysiwyg/types/wysiwyg-mention-item.type'

export const mentionItemsKey: InjectionKey<
  MaybeRefOrGetter<IWysiwygMentionItem[] | null | undefined> | undefined
> = Symbol('mentionItems')

export const mentionEntityKey: InjectionKey<
  MaybeRefOrGetter<IItem | null | undefined> | undefined
> = Symbol('mentionEntity')
