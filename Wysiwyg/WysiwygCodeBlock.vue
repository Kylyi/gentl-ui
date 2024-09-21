<script setup lang="ts">
import { NodeViewContent, nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'

// Functions
import { useWysiwygCodeBlock } from '~/components/Wysiwyg/functions/useWysiwygCodeBlock'

const props = defineProps(nodeViewProps)

// Utils
const { highlight, languages } = useWysiwygCodeBlock()
const { copy, copied } = useClipboard({ copiedDuring: 2000 })

// Layout
const el = ref<HTMLPreElement>()
const menuContentEl = ref<HTMLDivElement>()
const content = ref(() => props.node.textContent)

const language = computed({
  get() {
    return props.node.attrs.language
  },
  set(val: string) {
    props.updateAttributes({ language: val ?? '' })
  },
})

const highlighted = computedAsync(async () => {
  if (!toValue(content.value)) {
    return
  }

  return await highlight(toValue(content.value) ?? '', language.value)
})
function getLanguageLabel(opt: string | IItem) {
  if (!opt) {
    return
  }

  if (typeof opt === 'string') {
    return languages.find(l => l.id === opt || l.name === opt || l.aliases?.includes(opt))?.name
  } else {
    return opt.name
  }
}

// Menu
const isMenuActive = ref(false)

useMutationObserver(el, () => {
  const elDom = unrefElement(el)

  if (elDom?.classList.contains('has-focus')) {
    $hide({ all: true })

    nextTick(() => {
      isMenuActive.value = true
    })
  }
}, { attributes: true, attributeFilter: ['class'] })
</script>

<template>
  <NodeViewWrapper
    ref="el"
    as="pre"
    class="wysiwyg-code-block"
    :class="{ 'has-menu-active': isMenuActive }"
    @dblclick="copy(toValue(content))"
  >
    <Menu
      v-model="isMenuActive"
      manual
      tabindex="-1"
      placement="top-start"
      no-transition
      :ui="{
        contentClass: '!rounded-b-0 bg-white dark:bg-black !overflow-hidden',
      }"
      class="!shadow-none !rounded-b-0 !border-black !dark:border-white"
      :fit="false"
      :offset="-1"
      no-bounce
    >
      <div
        ref="menuContentEl"
        flex="~ items-center"
        overflow="hidden"
      >
        <Selector
          v-model="language"
          :options="languages"
          size="sm"
          w="60"
          emit-key
          no-menu-match-width
          :menu-props="{ matchWidth: false, fit: true, referenceTarget: menuContentEl }"
          :option-label="getLanguageLabel"
          no-border
          :placeholder="`${$t('wysiwyg.chooseLanguage')}...`"
          :ui="{ borderRadius: '0px' }"
        >
          <template
            v-if="language"
            #selection
          >
            {{ getLanguageLabel(language) }}
          </template>
        </Selector>

        <Btn
          icon="i-bx:copy !h-4 !w-4"
          class="!rounded-0 !border-0"
          @click="copy(toValue(content))"
        />

        <div
          class="copy-confirmation"
          :class="{ 'is-active': copied }"
        >
          {{ $t('general.copied') }}
        </div>
      </div>
    </Menu>

    <div relative>
      <span
        v-if="highlighted"
        class="wysiwyg-code-block__highlighted"
        v-html="highlighted"
      />
      <NodeViewContent
        as="code"
        class="wysiwyg-code-block__content"
      />
    </div>
  </NodeViewWrapper>
</template>

<style lang="scss" scoped>
.wysiwyg-code-block {
  @apply relative border-1 border-ca rounded-custom p-2 m-y-1;

  &.has-menu-active,
  &.has-focus {
    @apply rounded-tl-0 border-black dark:border-white;
  }

  &__highlighted {
    @apply absolute inset-0 pointer-events-none;

    :deep(.shiki) {
      @apply "!bg-transparent";
    }
  }

  &__content {
    @apply caret-gray color-transparent bg-transparent whitespace-pre;
  }
}

.copy-confirmation {
  @apply flex flex-center absolute inset-0 translate-y-full transition-transform
    bg-white dark:bg-darker color-positive;

  &.is-active {
    @apply translate-y-0;
  }
}
</style>
