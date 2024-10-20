<script setup lang="ts">
import {
  flip,
  offset,
  shift,
  size,
} from '@floating-ui/dom'

import { type MaybeElement, useFloating } from '@floating-ui/vue'

// Store
import { useWysiwygStore } from '~/components/Wysiwyg/wysiwyg.store'

type IProps = {
  dom: MaybeElement<any> | null
  type: 'table'
  pos: number
}

const props = defineProps<IProps>()

// Utils
const middleware = ref([
  offset(0),
  flip(),
  shift(),
  size({
    apply: ({ availableHeight, elements }) => {
      const { width } = elements.reference.getBoundingClientRect()
      Object.assign(elements.floating.style, {
        maxWidth: `${width}px`,
        maxHeight: `${availableHeight}px`,
        minWidth: `${width}px`,
      })
    },
  }),
])

// Store
const { editor } = storeToRefs(useWysiwygStore())

// Layout
const domEl = toRef(props, 'dom')
const floatingEl = useTemplateRef('floatingEl')
const { width } = useElementSize(domEl)

const { floatingStyles, update } = useFloating(domEl, floatingEl, {
  strategy: 'absolute',
  middleware,
  placement: 'top',
})

const tableClasses = computed({
  get() {
    const classes: string = editor.value?.getAttributes(props.type)?.class ?? ''

    return classes.split(' ')
  },
  set(val) {
    editor.value?.chain().updateAttributes(props.type, {
      class: val.join(' '),
    }).focus(props.pos).run()

    nextTick(() => {
      editor.value?.chain().focus(props.pos).run()
    })
  },
})

const tableStyle = computed({
  get() {
    const style: string = editor.value?.getAttributes(props.type)?.style ?? ''

    return style.split(';').filter(Boolean).map(trim).reduce((agg, property) => {
      const [key, value] = property.trim().split(':')

      agg[key] = value.trim()

      return agg
    }, {} as Record<string, string>) ?? {}
  },
  set(val) {
    editor.value?.chain().updateAttributes(props.type, {
      style: Object.entries(cleanObject(val)).reduce((agg, [key, value]) => {
        return `${agg}${key}:${value};`
      }, ''),
    }).run()

    nextTick(() => {
      editor.value?.chain().focus(props.pos).run()
    })
  },
})

watchThrottled(width, () => {
  update()
}, { leading: false, trailing: true, throttle: 150 })
</script>

<template>
  <div
    v-if="domEl"
    ref="floatingEl"
    :style="floatingStyles"
  >
    <HorizontalScroller>
      <!-- Add column before -->
      <Btn
        size="sm"
        color="ca"
        icon="i-majesticons:add-column rotate-180"
        :tooltip="$t('wysiwyg.addColumnBefore')"
        @mousedown.stop.prevent
        @click="editor?.chain().focus().addColumnBefore().run()"
      />

      <!-- Add column after -->
      <Btn
        size="sm"
        color="ca"
        icon="i-majesticons:add-column"
        :tooltip="$t('wysiwyg.addColumnAfter')"
        @mousedown.stop.prevent
        @click="editor?.chain().focus().addColumnAfter().run()"
      />

      <!-- Remove column -->
      <Btn
        size="sm"
        color="ca"
        icon="i-mdi:table-column-remove"
        :tooltip="$t('wysiwyg.removeColumn')"
        @mousedown.stop.prevent
        @click="editor?.chain().focus().deleteColumn().run()"
      />

      <Separator
        spaced
        vertical
      />

      <!-- Add row before -->
      <Btn
        size="sm"
        color="ca"
        icon="i-majesticons:add-row-line rotate-180"
        :tooltip="$t('wysiwyg.addRowBefore')"
        @mousedown.stop.prevent
        @click="editor?.chain().focus().addRowBefore().run()"
      />

      <!-- Add row after -->
      <Btn
        size="sm"
        color="ca"
        icon="i-majesticons:add-row-line"
        :tooltip="$t('wysiwyg.addRowAfter')"
        @mousedown.stop.prevent
        @click="editor?.chain().focus().addRowAfter().run()"
      />

      <!-- Remove row -->
      <Btn
        size="sm"
        color="ca"
        icon="i-mdi:table-row-remove"
        :tooltip="$t('wysiwyg.removeRow')"
        @mousedown.stop.prevent
        @click="editor?.chain().focus().deleteRow().run()"
      />

      <Separator
        spaced
        vertical
      />

      <!-- Merge cells -->
      <Btn
        size="sm"
        color="ca"
        icon="i-ant-design:merge-cells-outlined"
        :tooltip="$t('wysiwyg.mergeCells')"
        @mousedown.stop.prevent
        @click="editor?.chain().focus().mergeCells().run()"
      />

      <!-- Split cells -->
      <Btn
        size="sm"
        color="ca"
        icon="i-ant-design:split-cells-outlined"
        :tooltip="$t('wysiwyg.splitCells')"
        @mousedown.stop.prevent
        @click="editor?.chain().focus().splitCell().run()"
      />

      <Separator
        spaced
        vertical
      />

      <!-- Toggle header row -->
      <Btn
        size="sm"
        color="ca"
        icon="i-fluent:layout-column-three-focus-left-24-filled rotate-90"
        :tooltip="$t('wysiwyg.toggleHeaderRow')"
        @mousedown.stop.prevent
        @click="editor?.chain().focus().toggleHeaderRow().run()"
      />

      <!-- Toggle header column -->
      <Btn
        size="sm"
        color="ca"
        icon="i-fluent:layout-column-three-focus-left-24-filled"
        :tooltip="$t('wysiwyg.toggleHeaderColumn')"
        @mousedown.stop.prevent
        @click="editor?.chain().focus().toggleHeaderColumn().run()"
      />

      <div
        flex="~ items-center"
        m="l-auto"
      >
        <!-- Fix table -->
        <Btn
          size="sm"
          color="ca"
          icon="i-ic:baseline-auto-fix-high"
          :tooltip="$t('wysiwyg.fixTable')"
          @mousedown.stop.prevent
          @click="editor?.chain().focus().fixTables().run()"
        />

        <!-- Settings -->
        <Btn
          size="sm"
          color="ca"
          icon="i-fluent:settings-24-filled"
          :tooltip="$t('general.settings')"
          @mousedown.stop.prevent
        >
          <MenuProxy w="100">
            <WysiwygComponentClasses
              v-model:classes="tableClasses"
              :properties="['table-separator']"
            />

            <WysiwygComponentCss
              v-model:css="tableStyle"
              :properties="['colors', 'margin', 'border-radius']"
            />
          </MenuProxy>
        </Btn>

        <CrudBtnDelete
          size="sm"
          :menu-props="{ title: '', placement: 'top-end' }"
          m="l-auto"
          @delete="editor?.chain().focus().deleteTable().run()"
        />
      </div>
    </HorizontalScroller>
  </div>
</template>
