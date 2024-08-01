import { PluginKey } from '@tiptap/pm/state'
import { mergeAttributes } from '@tiptap/core'
import Mention from '@tiptap/extension-mention'
import type { ClientRectObject } from '@floating-ui/dom'

// Types
import type { IWysiwygProps } from '~/components/Wysiwyg/types/wysiwyg-props.type'
import type { IListFetchFnc } from '~/components/List/types/list-fetch.type'

// Components
import type WysiwygMention from '~/components/Wysiwyg/WysiwygMention.vue'

/**
 * Mention https://tiptap.dev/api/nodes/mention
 */
export function useWysiwygMention(
  props: Pick<IWysiwygProps, 'mentionSetup'>,
) {
  // Layout
  const mentionEl = ref<InstanceType<typeof WysiwygMention>>()
  const selectFnc = ref(() => {}) as Ref<(props?: any) => void>
  const getRect = ref(() => {}) as Ref<() => ClientRectObject>
  const loadData = ref() as Ref<IListFetchFnc>

  const extensions = props.mentionSetup
    ?.map(setup => {
      return Mention
        .extend({ name: setup.char })
        .configure({
          renderHTML: ({ node, options }) => {
            const { id, label } = node.attrs
            const appendedChar = setup.appendChar ?? ''
            const mentionType = setup.type ?? 'default'

            return [
              'span',
              mergeAttributes(options.HTMLAttributes, { 'class': 'mention', 'data-mention-type': mentionType }),
            `${setup.char} ${label ?? id}${appendedChar}`,
            ]
          },
          suggestion: {
            char: setup.char,
            pluginKey: new PluginKey(setup.char),
            items: ({ query }) => {
              mentionEl.value?.load(setup.loadData, query)

              return []
            },
            render: () => ({
              onStart: ({ clientRect, command }) => {
                if (!clientRect) {
                  return
                }

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
    selectFnc,
    MentionExtensions: extensions,
  }
}
