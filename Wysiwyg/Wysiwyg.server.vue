<script setup lang="ts">
// Types
import type { IWysiwygProps } from '~/components/Wysiwyg/types/wysiwyg-props.type'
import type { IItem } from '~/libs/App/types/item.type'

// Functions
import { useValueFormatterUtils } from '~/components/ValueFormatter/functions/useValueForamtterUtils'

import { mentionEntityKey } from '~/components/Wysiwyg/provide/wysiwyg.provide'

// Constants
import { mentionItemsMap } from '~/components/Wysiwyg/constants/resolve-values.map'

const props = defineProps<
  IWysiwygProps & { resolveMentionItems?: boolean; mentionEntity?: IItem }
>()
const self = getCurrentInstance()

// Utils
const { formatValue } = useValueFormatterUtils()

// Layout
const model = toRef(props, 'modelValue')
const isServer = !!process.server
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
    const entity = toValue(mentionEntity)

    ;(self?.proxy?.$el?.querySelectorAll('[data-id]') as Element[]).forEach(
      el => {
        const attrValue = el.getAttribute('data-id')

        if (attrValue) {
          const definition = mentionItemsMap.get(attrValue)

          if (!definition) {
            return ''
          }

          const value =
            definition.format?.(entity) ??
            formatValue(get(entity || {}, definition.id), undefined, {
              dataType: definition.dataType,
            }) ??
            `\${${attrValue}}`

          el.innerHTML = value
        }
      }
    )
  })
})
</script>

<template>
  <Field v-bind="wrapperProps">
    <div class="control">
      <ClientOnly>
        <p v-html="model" />
      </ClientOnly>

      <p
        v-if="isServer"
        v-html="model"
      />
    </div>
  </Field>
</template>

<style lang="scss" scoped>
:deep(.wysiwyg) {
  --apply: outline-none p-x-2;
}
</style>
