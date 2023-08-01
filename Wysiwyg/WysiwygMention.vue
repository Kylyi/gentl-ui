<script setup lang="ts">
import {
  ClientRectObject,
  VirtualElement,
  flip,
  offset,
  shift,
} from '@floating-ui/dom'
import { MaybeElement, useFloating } from '@floating-ui/vue'

// Types
import type { IWysiwygMentionItem } from '~/components/Wysiwyg/types/wysiwyg-mention-item.type'

// Components
import List from '~/components/List/List.vue'

type IProps = {
  items: IWysiwygMentionItem[]
  getRect: () => ClientRectObject
  selectFnc: Function
}

const props = defineProps<IProps>()

// Layout
const listEl = ref<InstanceType<typeof List>>()
const mentionEl = ref<HTMLElement>()
const items = toRef(props, 'items')
const isMentionOpen = ref(false)

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
  onKeyDown: (event: KeyboardEvent) => listEl.value?.handleKey(event, true),
})
</script>

<template>
  <div
    v-if="isMentionOpen"
    ref="mentionEl"
    :style="floatingStyles"
    :placement="placement"
    class="mention-items"
  >
    <List
      ref="listEl"
      no-search
      :items="items"
      :group-by="[{ field: 'group', name: 'group' }]"
      @update:selected="selectFnc($event)"
    />
  </div>
</template>

<style scoped lang="scss">
.mention-items {
  --apply: flex flex-gap-2 flex-col bg-ca p-2 rounded-custom z-$zMax max-h-100
    overflow-auto;
}
</style>
