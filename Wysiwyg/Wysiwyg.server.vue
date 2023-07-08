<script setup lang="ts">
// Types
import type { IWysiwygProps } from '~/components/Wysiwyg/types/wysiwyg-props.type'
import type { IItem } from '~/libs/App/types/item.type'

// Functions
import { useValueFormatterUtils } from '~/components/ValueFormatter/functions/useValueForamtterUtils'

import {
  mentionEntityKey,
  mentionItemsKey,
} from '~/components/Wysiwyg/provide/wysiwyg.provide'

const props = defineProps<
  IWysiwygProps & { resolveMentionItems?: boolean; mentionEntity?: IItem }
>()
const self = getCurrentInstance()

// Utils
const { formatValue } = useValueFormatterUtils()

// Layout
const mentionItems = injectStrict(mentionItemsKey, toRef(props, 'mentionItems'))
const mentionEntity = injectStrict(
  mentionEntityKey,
  toRef(props, 'mentionEntity')
)

// WRAPPER
const wrapperProps = reactivePick(
  props,
  'contentClass',
  'contentStyle',
  'disabled',
  'emptyValue',
  'errors',
  'errorTakesSpace',
  'errorVisible',
  'hint',
  'inline',
  'label',
  'labelClass',
  'labelInside',
  'labelStyle',
  'loading',
  'placeholder',
  'readonly',
  'required',
  'size',
  'stackLabel'
)

// This only happens when we explicity use the `Wysiwyg.server.vue` component
// because normally, on server side, we don't have the `onMounted` hook
onMounted(() => {
  nextTick(() => {
    const items = toValue(mentionItems)

    if (!items) {
      return
    }

    ;(self?.proxy?.$el?.querySelectorAll('[data-id]') as Element[]).forEach(
      el => {
        const attrValue = el.getAttribute('data-id')

        if (attrValue) {
          const mentionItem = items.find(item => item.id === attrValue)

          if (mentionItem) {
            const value =
              mentionItem.format?.(toValue(mentionEntity) || {}) ||
              formatValue(
                get(toValue(mentionEntity) || {}, mentionItem.id),
                undefined,
                {
                  dataType: mentionItem.dataType,
                }
              )
            el.innerHTML = value ?? `\${${mentionItem.label}}`
          }
        }
      }
    )
  })
})
</script>

<template>
  <Field v-bind="wrapperProps">
    <p
      class="control"
      v-html="modelValue"
    />
  </Field>
</template>

<style lang="scss" scoped>
:deep(.wysiwyg) {
  --apply: outline-none p-x-2;
}
</style>
