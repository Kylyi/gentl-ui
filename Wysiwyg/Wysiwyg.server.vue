<script setup lang="ts">
// // Types
// import type { IWysiwygProps } from '~/components/Wysiwyg/types/wysiwyg-props.type'
// import type { IItem } from '~/libs/Shared/types/item.type'

// // Functions
// import { useValueFormatterUtils } from '~/components/ValueFormatter/functions/useValueFormatterUtils'
// import { useInputWrapperUtils } from '~/components/Inputs/functions/useInputWrapperUtils'

// import { mentionEntityKey } from '~/components/Wysiwyg/provide/wysiwyg.provide'

// // Constants
// import { mentionItemsMap } from '~/components/Wysiwyg/constants/resolve-values.map'

// const props = defineProps<
//   IWysiwygProps & { resolveMentionItems?: boolean, mentionEntity?: IItem }
// >()
// const self = getCurrentInstance()

// // Utils
// const { formatValue } = useValueFormatterUtils()
// const { getInputWrapperProps } = useInputWrapperUtils()

// // Layout
// const model = toRef(props, 'modelValue')
// const isServer = !!import.meta.server
// const mentionEntity = injectStrict(
//   mentionEntityKey,
//   toRef(props, 'mentionEntity'),
// )

// // Wrapper
// const wrapperProps = getInputWrapperProps(props)

// // This only happens when we explicity use the `Wysiwyg.server.vue` component
// // because normally, on server side, we don't have the `onMounted` hook
// onMounted(() => {
//   nextTick(() => {
//     const entity = toValue(mentionEntity)

//     ;(self?.proxy?.$el?.querySelectorAll('[data-id]') as Element[]).forEach(
//       el => {
//         const attrValue = el.getAttribute('data-id')

//         if (attrValue) {
//           const definition = mentionItemsMap.get(attrValue)

//           if (!definition) {
//             return ''
//           }

//           const value
//             = definition.format?.(entity)
//             ?? formatValue(get(entity || {}, definition.id), undefined, {
//               dataType: definition.dataType,
//             })
//             ?? `\${${attrValue}}`

//           el.innerHTML = value
//         }
//       },
//     )
//   })
// })
</script>

<template>
  <div>idk</div>
  <!-- <Field v-bind="wrapperProps">
    <ClientOnly>
      <p v-html="model" />
    </ClientOnly>

    <p
      v-if="isServer"
      v-html="model"
    />
  </Field> -->
</template>

<style lang="scss" scoped>
:deep(.wysiwyg) {
  @apply outline-none p-x-2;
}
</style>
