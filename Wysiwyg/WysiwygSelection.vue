<script setup lang="ts">
// Types
import type { IWysiwygProps } from '~/components/Wysiwyg/types/wysiwyg-props.type'

// Injections
import { wysiwygIdKey } from '~/components/Wysiwyg/provide/wysiwyg.provide'

// Constants
import { type IWysiwygNode, WYSIWYG_NODES_BY_NAME } from '~/components/Wysiwyg/constants/wysiwyg-node.constant'

// Store
import { useWysiwygStore } from '~/components/Wysiwyg/wysiwyg.store'

type IProps = {
  screenSize?: 'mobile' | 'tablet' | 'desktop'
  visuals?: IWysiwygProps['visuals']
}

defineProps<IProps>()

// Constants
const BODY_NODE: IWysiwygNode = {
  id: 'body',
  label: () => $t('wysiwyg.node.body'),
  icon: 'i-mdi:card-outline',
  ref: undefined,
  properties: ['colors'],
}

// Injections
const uuid = injectLocal(wysiwygIdKey, useId()) as string

// Store
const { currentNodeSelection } = storeToRefs(useWysiwygStore(uuid))

// Layout
const nodeSelected = ref<IItem>()
const visuals = defineModel<IProps['visuals']>('visuals', { default: () => ({}) })
const screenSize = defineModel<IProps['screenSize']>(
  'screenSize',
  { default: 'mobile' },
) as Ref<'mobile' | 'tablet' | 'desktop'>

const nodes = computed(() => {
  return [
    BODY_NODE,
    ...currentNodeSelection.value.nodes
      ?.map(node => ({ ...WYSIWYG_NODES_BY_NAME[node.type.name], ref: node }))
      .filter(node => !!node.id),
  ]
})

const nodeVisuals = computed({
  get() {
    const nodeId = nodeSelected.value?.ref?.attrs!.id

    // When `nodeId` is nullish, we assume it's for the body
    if (!nodeId) {
      if (screenSize.value !== 'mobile') {
        return visuals.value?.body?.[screenSize.value] ?? {}
      }

      return visuals.value?.body ?? {}

      return
    }

    // Otherwise, it's an actual node
    if (screenSize.value !== 'mobile') {
      return visuals.value?.[nodeSelected.value?.ref?.attrs?.id]?.[screenSize.value] ?? {}
    }

    return visuals.value?.[nodeSelected.value?.ref?.attrs?.id] ?? {}
  },
  set(val) {
    const nodeId = nodeSelected.value!.ref?.attrs?.id

    // When `nodeId` is nullish, we assume it's for the body
    if (!nodeId) {
      if (screenSize.value !== 'mobile') {
        set(visuals.value!, `body.${screenSize.value}`, val)

        // We need to trigger the reactivity here
        visuals.value = { ...visuals.value }
      } else {
        visuals.value = {
          ...visuals.value,
          body: val,
        }
      }

      return
    }

    // Otherwise, it's an actual node
    if (screenSize.value !== 'mobile') {
      set(visuals.value!, `${nodeId}.${screenSize.value}`, val)

      // We need to trigger the reactivity here
      visuals.value = { ...visuals.value }
    } else {
      visuals.value = {
        ...visuals.value,
        [nodeId]: val,
      }
    }
  },
})

// Auto-select the last node
watch(currentNodeSelection, selection => {
  if (selection.nodes.length) {
    const lastNode = selection.nodes[selection.nodes.length - 1]
    const node = nodes.value.find(node => node.id === lastNode.type.name)

    nodeSelected.value = node
  }
}, { immediate: true })
</script>

<template>
  <div class="wysiwyg-selection">
    <div flex="~ items-center">
      <!-- Nodes -->
      <HorizontalScroller
        grow
        content-class="gap-1"
      >
        <Btn
          v-for="(node, idx) in nodes"
          :key="idx"
          size="sm"
          no-uppercase
          :icon="node.icon"
          :label="node.label()"
          :class="{ 'is-active': nodeSelected?.id === node.id }"
          @click="nodeSelected = node"
        />
      </HorizontalScroller>

      <!-- Screen sizes -->
      <div flex="~ gap-1 items-center">
        <Btn
          size="xs"
          icon="i-uiw:mobile"
          :class="{ 'is-active-alt': screenSize === 'mobile' }"
          @click="screenSize = 'mobile'"
        />
        <Btn
          size="xs"
          icon="i-la:tablet-alt"
          :class="{ 'is-active-alt': screenSize === 'tablet' }"
          @click="screenSize = 'tablet'"
        />
        <Btn
          size="xs"
          icon="i-prime:desktop"
          :class="{ 'is-active-alt': screenSize === 'desktop' }"
          @click="screenSize = 'desktop'"
        />
      </div>
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

    <Separator m="y-2" />

    <!-- CSS -->
    <div flex="~ col gap-2">
      <WysiwygComponentCss
        v-model:css="nodeVisuals"
        :properties="nodeSelected?.properties"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wysiwyg-selection {
  @apply flex flex-col overflow-auto p-2;

  .is-active {
    @apply bg-primary color-white;
  }

  .is-active-alt {
    @apply bg-secondary color-white;
  }
}
</style>
