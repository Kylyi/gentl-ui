<script setup lang="ts">
import { EditorContent } from '@tiptap/vue-3'

// Types
import { useWysiwygInit } from '~/components/Wysiwyg/functions/useWysiwygInit'
import type { IWysiwygProps } from '~/components/Wysiwyg/types/wysiwyg-props.type'

const props = defineProps<Pick<IWysiwygProps, 'modelValue' | 'editDialog' | 'features' | 'sink' | 'visuals'>>()

// Layout
const isOpen = defineModel<IWysiwygProps['editDialog']>('editDialog')
const visuals = defineModel<IWysiwygProps['visuals']>('visuals', { default: () => ({}) })
const { model, isModified } = useRefReset(() => props.modelValue)

const bodyId = computed(() => {
  return visuals.value?.body?.['--id']
})

// Screen sizes
const screenSize = ref<'mobile' | 'tablet' | 'desktop'>('mobile')

// Editor
const { editor, isEditable } = useWysiwygInit(props, model)

// Apply the visuals
let styleElement: HTMLStyleElement | undefined

whenever(visuals, visuals => {
  if (!styleElement) {
    styleElement = document.createElement('style')
    styleElement.id = 'dynamic-styles'
    document.head.appendChild(styleElement)
  }

  let baseCSS = ''
  let tabletCSS = ''
  let desktopCSS = ''

  Object.entries(visuals).forEach(([id, properties]) => {
    if (id === 'body') {
      id = `${id}_${properties['--id']}`
    }

    baseCSS += `[data-id="${id}"] {\n`

    Object.entries(properties).forEach(([property, value]) => {
      if (property === 'tablet') {
        Object.entries(value).forEach(([tabletProp, tabletVal]) => {
          tabletCSS += `  [data-id="${id}"] {\n    ${tabletProp}: ${tabletVal} !important;\n  }\n`
        })
      } else if (property === 'desktop') {
        Object.entries(value).forEach(([desktopProp, desktopVal]) => {
          desktopCSS += `  [data-id="${id}"] {\n    ${desktopProp}: ${desktopVal} !important;\n  }\n`
        })
      } else {
        baseCSS += `  ${property}: ${value} !important;\n`
      }
    })

    baseCSS += '}\n'
  })

  let css = baseCSS

  if (tabletCSS) {
    css += `@container (min-width: 768px) {\n${tabletCSS}}\n`
  }

  if (desktopCSS) {
    css += `@container (min-width: 1536px) {\n${desktopCSS}}\n`
  }

  styleElement.textContent = css
}, { deep: true, immediate: true })
</script>

<template>
  <Dialog
    v-model="isOpen"
    manual
    w="9/10"
    h="9/10"
    :ui="{ contentClass: 'p-0' }"
  >
    <Form
      class="wyswiyg-edit-dialog"
      p="!b-0"
    >
      <div class="content-wrapper">
        <div
          class="content-wrapper__inner"
          :class="`is-${screenSize}`"
          m="t-1"
        >
          <EditorContent
            :editor
            class="content"
            :data-id="`body_${bodyId}`"
            @drop.stop.prevent
          />
        </div>

        <WysiwygSink
          v-if="editor"
          :features
          :sink
          :editable="isEditable"
          justify-center
          border="t-1 ca"
          bg="white dark:darker"
        />
      </div>

      <WysiwygSelection
        v-model:visuals="visuals"
        v-model:screen-size="screenSize"
      />
    </Form>
  </Dialog>
</template>

<style lang="scss" scoped>
@import url('style/wysiwyg.style.scss');

:deep(.wyswiyg-edit-dialog) {
  @apply grid;

  grid-template-columns: 1fr 320px;
}

:deep(.wysiwyg) {
  @apply p-2;
}

.wyswiyg-edit-dialog {
  .content-wrapper {
    @apply flex flex-col gap-1 overflow-auto bg-ca rounded-custom;

    &__inner {
      container-type: inline-size;

      @apply grow overflow-auto m-x-auto border-1 border-ca box-content bg-white dark:bg-darker;

      &.is-mobile {
        @apply min-w-360px max-w-360px h-full;
      }

      &.is-tablet {
        @apply min-w-768px max-w-768px h-full;
      }

      &.is-desktop {
        @apply min-w-1536px max-w-1536px h-full;
      }
    }
  }

  .content {
    @apply fit overflow-auto;

    container-type: inline-size;
  }
}
</style>
