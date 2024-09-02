// Types
import type { IWysiwygMentionSetup } from '~/components/Wysiwyg/types/wysiwyg-mention-setup.type'

// General
export const wysiwygIdKey: InjectionKey<string> = Symbol('wysiwygId')

export const wysiwygModelKey: InjectionKey<Ref<any>> = Symbol('wysiwygModel')

// Mentons
export const wysiwygMentionSetupKey: InjectionKey<MaybeRefOrGetter<IWysiwygMentionSetup[]>> = Symbol('wysiwygMentionSetup')

export const wysiwygMentionPopulateKey: InjectionKey<(id: string | number) => any> = Symbol('wysiwygMentionPopulate')
