<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'

// Store
import { useWysiwygStore } from '~/components/Wysiwyg/wysiwyg.store'

const props = defineProps(nodeViewProps)
const { node, updateAttributes } = props

// Store
const wysiwygStore = useWysiwygStore()

// Layout
const href = ref<string | undefined>(node.attrs.href)
const content = ref(node.attrs.content)

function setContent(val?: string | null) {
  updateAttributes({ content: val ?? '' })
}

function setHref(val?: string | null) {
  updateAttributes({ href: val ?? '' })
}

// Menu
const isMenuActive = ref(false)

// Mentions
const mentions = computedAsync(async () => {
  const mentionItems: IItem[] = []

  for await (const item of (wysiwygStore.mentionSetup ?? [])) {
    const res = item.loadData({})

    mentionItems.push(...res.data)
  }

  return mentionItems.flat()
})

function addTemplateVariable(mention: IItem) {
  setHref(`${href.value}{{${mention.id}}}`)
}

watch(
  () => props.node.attrs.content,
  _content => content.value = _content,
)

watch(
  () => props.node.attrs.href,
  _href => href.value = _href,
)
</script>

<template>
  <NodeViewWrapper
    as="a"
    class="wysiwyg-email-btn"
    :class="{ 'has-open-menu': isMenuActive }"
    draggable="true"
    contenteditable="false"
    :href="node.attrs.href"
    data-type="wysiwyg-email-btn"
    :data-id="node.attrs.id"
    data-drag-handle
    @click.stop.prevent="isMenuActive = true"
  >
    <!-- <NodeViewContent pointer-events="none" /> -->
    <span>
      {{ content }}
    </span>

    <!-- Configuration -->
    <MenuProxy
      v-model="isMenuActive"
      manual
      w="100"
      :no-overlay="false"
      :no-uplift="true"
      :no-arrow="false"
      :menu="$t('general.settings')"
    >
      <!-- Content -->
      <TextInput
        :model-value="content"
        :label="$t('wysiwyg.content')"
        :empty-value="$t('general.noValue')"
        @update:model-value="setContent"
      />

      <!-- Url -->
      <TextArea
        :model-value="href"
        :mask="{ mask: /^(?!.* ).*$/ }"
        :label="$t('general.link')"
        placeholder="https://google.com"
        @update:model-value="setHref"
      >
          <template #tooltip>
            <div
              class="attribute__id-tooltip"
              @click.stop.prevent
              @mousedown.stop.prevent
            >
              <div
                flex="~ gap-1"
                p="l-2 y-2"
              >
                <Chip
                  v-for="mention in mentions"
                  :key="mention.id"
                  p="x-2"
                  :ripple="true"
                  :label="mention.label"
                  @click.stop.prevent="addTemplateVariable(mention)"
                  @mousedown.stop.prevent
                />
              </div>

              <small
                text="caption"
                p="x-2"
                >
                {{ $t('wysiwyg.addTemplateVariableHint') }}
              </small>
            </div>
          </template>
        </TextArea>
    </MenuProxy>
  </NodeViewWrapper>
</template>

<style lang="scss">
.wysiwyg-email-btn {
  @apply relative inline-flex cursor-move;

  &:hover,
  &.has-open-menu {
    @apply outline-offset-2 outline-1 outline-ca outline-solid;

    .wysiwyg-email-btn__actions {
      @apply flex;
    }
  }
}
</style>
