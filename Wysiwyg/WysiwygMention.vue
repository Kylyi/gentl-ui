<script setup lang="ts">
import {
  type ClientRectObject,
  type VirtualElement,
  flip,
  offset,
  shift,
} from '@floating-ui/dom'
import { type MaybeElement, useFloating } from '@floating-ui/vue'

// Types
import type { IListProps } from '~/components/List/types/list-props.type'
import type { IListFetchFnc } from '~/components/List/types/list-fetch.type'

// Components
import List from '~/components/List/List.vue'

type IProps = {
  getRect: () => ClientRectObject
  selectFnc: Function
  listProps?: Partial<IListProps>
  loadData: IListFetchFnc
}

const props = defineProps<IProps>()

// Layout
const listEl = ref<InstanceType<typeof List>>()
const mentionEl = ref<HTMLElement>()
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

function hide() {
  isMentionOpen.value = false
}

const searchList = ref('')

defineExpose({
  show: () => (isMentionOpen.value = true),
  hide: () => (isMentionOpen.value = false),
  onKeyDown: (event: KeyboardEvent) => listEl.value?.handleKey(event, { force: true }),
  load: async (search?: string) => {
    searchList.value = search ?? ''
  },
})
</script>

<template>
  <div
    v-if="isMentionOpen"
    ref="mentionEl"
    :style="floatingStyles"
    :placement="placement"
    class="mention-items floating-element"
    .hide="hide"
  >
    <List
      ref="listEl"
      v-model:search="searchList"
      no-autofocus
      no-filter
      no-search
      :load-data="{ fnc: loadData, onSearch: true }"
      row-class="!min-h-8"
      v-bind="listProps"
      @update:selected="selectFnc($event)"
    />
  </div>
</template>

<style scoped lang="scss">
.mention-items {
  @apply flex flex-gap-2 flex-col rounded-custom z-$zMax max-h-100
    overflow-auto border-1 border-ca min-w-40 bg-white dark:bg-darker;
}
</style>
