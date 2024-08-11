import { PluginKey } from '@tiptap/pm/state'
import { mergeAttributes } from '@tiptap/core'
import Mention from '@tiptap/extension-mention'
import type { ClientRectObject } from '@floating-ui/dom'

// Types
import type { IListProps } from '~/components/List/types/list-props.type'
import type { IListFetchFnc } from '~/components/List/types/list-fetch.type'
import type { IWysiwygProps } from '~/components/Wysiwyg/types/wysiwyg-props.type'

// Injections
import { wysiwygMentionSetupKey } from '~/components/Wysiwyg/provide/wysiwyg.provide'

// Components
import type WysiwygMention from '~/components/Wysiwyg/WysiwygMention.vue'
import { useWysiwygUtils } from '~/components/Wysiwyg/functions/useWysiwygUtils'

/**
 * Mention https://tiptap.dev/api/nodes/mention
 */
export function useWysiwygMention(
  props: Pick<IWysiwygProps, 'mentionSetup' | 'mentionReplace' | 'onMentionResolve'>,
) {
  // Utils
  const { resolveMentions } = useWysiwygUtils()

  // Injections
  const mentionSetup = injectStrict(
    wysiwygMentionSetupKey,
    props.mentionSetup ?? [],
  )

  // Layout
  const mentionEl = ref<InstanceType<typeof WysiwygMention>>()
  const selectFnc = ref(() => {}) as Ref<(props?: any) => void>
  const getRect = ref(() => {}) as Ref<() => ClientRectObject>
  const loadData = ref() as Ref<IListFetchFnc>
  const listProps = ref<Partial<IListProps>>()

  const extensions = toValue(mentionSetup)
    .map(setup => {
      return Mention
        .extend({
          name: setup.char,
          parseHTML() {
            return [
              { tag: 'span[data-type="mention"]' },
            ]
          },
        })
        .configure({
          renderHTML: ({ node, options }) => {
            const { id, label } = node.attrs
            const appendedChar = setup.appendChar ?? ''
            const mentionType = setup.type ?? 'default'

            if (props.mentionReplace) {
              nextTick(() => {
                resolveMentions(undefined, true, { onMentionResolve: props.onMentionResolve })
              })
            }

            return [
              'span',
              mergeAttributes(options.HTMLAttributes, {
                'class': 'mention',
                'data-mention-type': mentionType,
                'data-type': 'mention',
              }),
            `${setup.char}${label ?? id}${appendedChar}`,
            ]
          },
          suggestion: {
            char: setup.char,
            pluginKey: new PluginKey(setup.char),
            items: ({ query }) => {
              mentionEl.value?.load(query)

              return []
            },
            render: () => ({
              onStart: ({ clientRect, command }) => {
                if (!clientRect) {
                  return
                }

                loadData.value = setup.loadData
                listProps.value = setup.listProps

                getRect.value = clientRect as () => ClientRectObject
                selectFnc.value = command

                setTimeout(() => {
                  mentionEl.value?.show()
                })
              },
              onExit: () => mentionEl.value?.hide(),
              onKeyDown: ({ event }) => {
                mentionEl.value?.onKeyDown(event)

                if (event.key === 'Enter') {
                  event.preventDefault?.()
                  event.stopPropagation?.()

                  return true
                }

                return false
              },
            }),
          },
        })
    }) ?? []

  return {
    mentionEl,
    getRect,
    loadData,
    listProps,
    selectFnc,
    MentionExtensions: extensions,
  }
}
