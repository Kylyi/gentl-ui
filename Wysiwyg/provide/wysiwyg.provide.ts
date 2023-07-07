import { IWysiwygMentionItem } from '~/components/Wysiwyg/types/wysiwyg-mention-item.type'
import { IItem } from '~/libs/App/types/item.type'

export const mentionItemsKey: InjectionKey<
  Ref<IWysiwygMentionItem[] | null | undefined> | undefined
> = Symbol('mentionItems')

export const mentionEntityKey: InjectionKey<
  Ref<IItem | null | undefined> | undefined
> = Symbol('mentionEntity')
