<script setup lang="ts">
// Types
import type { IWysiwygProps } from '~/components/Wysiwyg/types/wysiwyg-props.type'

// Injections
import { wysiwygIdKey } from '~/components/Wysiwyg/provide/wysiwyg.provide'

// Constants
import { WYSIWYG_SELECTION_ITEMS_BY_ID } from '~/components/Wysiwyg/constants/wysiwyg-selection-items.constant'

// Store
import { useWysiwygStore } from '~/components/Wysiwyg/wysiwyg.store'

type IProps = {
  visuals?: IWysiwygProps['visuals']
}

defineProps<IProps>()

// Injections
const uuid = injectLocal(wysiwygIdKey, useId()) as string

// Store
const { currentNodeSelection } = storeToRefs(useWysiwygStore(uuid))

// Layout
const nodeSelected = ref<IItem>()
const visuals = defineModel<IProps['visuals']>('visuals')

const nodes = computed(() => {
  console.log(currentNodeSelection.value.nodes.map(e => e.type.name))

  return currentNodeSelection.value.nodes
    ?.map(node => ({ ...WYSIWYG_SELECTION_ITEMS_BY_ID[node.type.name], ref: node }))
    .filter(node => !!node.id)
})

const nodeVisuals = computed({
  get() {
    return visuals.value?.[nodeSelected.value?.attrs?.id] ?? {}
  },
  set(val) {
    visuals.value = {
      ...visuals.value,
      [nodeSelected.value!.attrs!.id!]: val,
    }
  },
})

watch(currentNodeSelection, selection => {
  if (selection.nodes.length) {
    nodeSelected.value = selection.nodes[selection.nodes.length - 1]
  }
})
</script>

<template>
  <div class="wysiwyg-selection">
    <!-- Nodes -->
    <HorizontalScroller>
      <Btn
        v-for="(node, idx) in nodes"
        :key="idx"
        size="sm"
        no-uppercase
        :icon="node.icon"
        :label="node.label()"
        :class="{ 'is-active': nodeSelected === node.ref }"
        @click="nodeSelected = node.ref"
      />
    </HorizontalScroller>

    <!-- Marks -->
    <div
      v-if="currentNodeSelection.marks.length"
      flex="~ gap-1 items-center"
    >
      <div class="i-ri:mark-pen-line w-5 h-5 shrink-0" />

      <HorizontalScroller>
        <Btn
          v-for="(mark, idx) in currentNodeSelection.marks"
          :key="idx"
          size="sm"
          no-uppercase
          :label="mark.type.name"
          @click="nodeSelected = mark"
        />
      </HorizontalScroller>
    </div>

    <WysiwygComponentCss
      v-if="nodeSelected?.attrs.id"
      v-model:css="nodeVisuals"
      :properties="['padding', 'colors', 'border', 'border-radius', 'margin', 'float', 'size']"
    />

    <pre>{{ nodeVisuals }}</pre>
  </div>
</template>

<style lang="scss" scoped>
.wysiwyg-selection {
  @apply flex flex-col gap-2 overflow-auto border-1 border-ca rounded-custom p-2;

  .is-active {
    @apply bg-primary color-white;
  }
}
</style>
