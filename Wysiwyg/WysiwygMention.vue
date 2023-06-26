<script setup lang="ts">
import {
  ClientRectObject,
  VirtualElement,
  flip,
  offset,
  shift,
} from '@floating-ui/dom'
import { MaybeElement, useFloating } from '@floating-ui/vue'

// TYPES
import type { IWysiwygMentionItem } from '~/components/Wysiwyg/types/wysiwyg-mention-item.type'

type IProps = {
  items: IWysiwygMentionItem[]
  getRect: () => ClientRectObject
  selectFnc: Function
}

const props = defineProps<IProps>()

// Layout
const mentionEl = ref<HTMLElement>()
const items = toRef(props, 'items')
const isMentionOpen = ref(false)
const selectedIdx = ref(-1)

const middleware = ref([offset(4), flip(), shift()])

const virtualEl = computed<MaybeElement<VirtualElement>>(() => {
  return {
    getBoundingClientRect: props.getRect,
  }
})
const { floatingStyles, placement } = useFloating(virtualEl, mentionEl, {
  strategy: 'fixed',
  placement: 'bottom-start',
  middleware,
})

defineExpose({
  show: () => (isMentionOpen.value = true),
  hide: () => (isMentionOpen.value = false),
  onKeyDown: (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        selectedIdx.value =
          (selectedIdx.value + items.value.length - 1) % items.value.length
        break

      case 'ArrowDown':
        selectedIdx.value = (selectedIdx.value + 1) % items.value.length
        break

      case 'Enter':
        props.selectFnc(items.value[selectedIdx.value])
        break

      case 'Escape':
        event.preventDefault()
        event.stopPropagation()
        break
    }
  },
})
</script>

<template>
  <div
    v-if="isMentionOpen"
    ref="mentionEl"
    :style="floatingStyles"
    :placement="placement"
  >
    <Item
      v-for="(item, idx) in items"
      :key="item.id"
      :class="{ 'color-secondary': selectedIdx === idx }"
      @mousenter="selectedIdx = idx"
      @mouseleave="selectedIdx = -1"
    >
      {{ item.label }}
    </Item>
  </div>
</template>
