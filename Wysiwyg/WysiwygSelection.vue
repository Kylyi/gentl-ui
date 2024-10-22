<script setup lang="ts">
// Store
import { useWysiwygStore } from '~/components/Wysiwyg/wysiwyg.store'

// Store
const { currentNodeSelection } = storeToRefs(useWysiwygStore())

// Layout
const nodeSelected = ref<IItem>()
</script>

<template>
  <div
    class="fixed bottom-20 right-20 z-$zMax"
    bg="white"
    max-w="200"
    w="200"
    max-h="200"
    h="200"
    overflow="auto"
    border="1 ca"
    rounded="custom"
    p="2"
  >
    <!-- Nodes -->
    <div flex="~ gap-1 items-center">
      <div class="i-bitcoin-icons:node-hardware-outline w-5 h-5 shrink-0" />

      <HorizontalScroller>
        <Btn
          v-for="(node, idx) in currentNodeSelection.nodes"
          :key="idx"
          size="sm"
          no-uppercase
          :label="node.type.name"
          @click="nodeSelected = node"
        />
      </HorizontalScroller>
    </div>

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

    <pre>{{ nodeSelected?.attrs }}</pre>
  </div>
</template>
