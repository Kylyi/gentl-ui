<script lang="ts">
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'

export default {
  components: {
    NodeViewWrapper,
  },

  props: nodeViewProps,

  setup(props) {
    const providedData = inject<IItem>('providedData')
    const componentData = providedData?.[props.node.attrs.uuid]

    return {
      componentData,
    }
  },
}
</script>

<template>
  <NodeViewWrapper class="vue-component">
    <img
      :src="componentData?.src"
      width="400"
      w="100"
      object="contain"
      draggable="true"
      data-drag-handle
    />
  </NodeViewWrapper>
</template>