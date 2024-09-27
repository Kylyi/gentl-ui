<script setup lang="ts">
import { offset } from '@floating-ui/dom'
import { useFloating } from '@floating-ui/vue'
import { NodeViewContent, nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'

// Functions
import { useWysiwygCodeBlock } from '~/components/Wysiwyg/functions/useWysiwygCodeBlock'

const props = defineProps(nodeViewProps)

// Constants
const fuseOptions = {
  keys: ['name', 'aliases'],
}

// Utils
const { highlight, languages } = useWysiwygCodeBlock()
const { copy, copied } = useClipboard({ copiedDuring: 2000 })

// Layout
const el = ref<HTMLPreElement>()
const configurationEl = ref<HTMLDivElement>()
const content = ref(() => props.node.textContent)

const language = computed({
  get() {
    return props.node.attrs.language
  },
  set(val: string) {
    props.updateAttributes({ language: val ?? '' })

    nextTick(() => {
      props.editor.commands.focus(currentPosition.value)
    })
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
const currentPosition = ref<number>()
const isMenuActive = ref(false)

const { floatingStyles } = useFloating(
  el,
  configurationEl,
  { placement: 'top-end', strategy: 'fixed', middleware: [offset(-1)] },
)

useMutationObserver(el, () => {
  const elDom = unrefElement(el)
  const isFocused = elDom?.classList.contains('has-focus')
  const selection = props.editor.view.state.selection.$anchor

  if (isFocused) {
    currentPosition.value = selection.pos

    nextTick(() => {
      isMenuActive.value = true
    })
  } else if (isMenuActive.value) {
    isMenuActive.value = selection.parent.textContent === props.node.textContent
  }
}, { attributes: true, attributeFilter: ['class'] })

onMounted(() => {
  const elDom = unrefElement(el)

  nextTick(() => {
    isMenuActive.value = !!elDom?.classList.contains('has-focus')
  })
})
</script>

<template>
  <NodeViewWrapper
    ref="el"
    as="pre"
    class="wysiwyg-code-block"
    :class="{ 'has-menu-active': isMenuActive }"
    @dblclick="copy(toValue(content))"
  >
    <div
      v-if="isMenuActive"
      ref="configurationEl"
      class="wysiwyg-code-block__configuration"
      :style="floatingStyles"
      tabindex="-1"
      @mousedown.stop.prevent
    >
      <Selector
        v-model="language"
        :options="languages"
        size="sm"
        grow
        emit-key
        no-menu-match-width
        :menu-props="{ matchWidth: false, fit: true, referenceTarget: configurationEl }"
        :option-label="getLanguageLabel"
        no-border
        :fuse-options
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
    @apply rounded-tr-0 border-black dark:border-white;
  }

  &__configuration {
    @apply flex items-center top-0 right-0 -translate-y-full w-80;
    @apply border-1 rounded-t-custom overflow-hidden z-$zMax;
    @apply bg-white border-black dark:(bg-black border-white);
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
