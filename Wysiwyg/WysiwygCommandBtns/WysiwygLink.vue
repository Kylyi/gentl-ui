<script setup lang="ts">
// Store
import { useWysiwygStore } from '~/components/Wysiwyg/wysiwyg.store'

// Components
import Menu from '~/components/Menu/Menu.vue'

// Store
const wysiwygStore = useWysiwygStore()

// Layout
const menuEl = ref<InstanceType<typeof Menu>>()
const { model: link, reset: linkReset } = useRefReset({
  url: '',
  text: '',
})
const { model: selection, reset: posReset } = useRefReset({ from: 0, to: 0 })

function reset() {
  linkReset()
  posReset()
}

function getSelectedLinkData() {
  const state = wysiwygStore.editor?.state

  if (!state) {
    return
  }

  const { from, to } = state.selection

  let linkMark: any
  let linkText = ''

  // We look for the `mark` that is `link` to initialize the link `href` and `text`
  state.doc.nodesBetween(from - 1, to, node => {
    if (node.isText) {
      const mark = node.marks.find(mark => mark.type.name === 'link')

      if (mark) {
        linkMark = mark
        linkText = node.text ?? ''
      }
    }
  })

  // If there is no `mark` found (~ we don't extend a link), we use the text from the selection
  if (!linkText) {
    linkText = state.doc.textBetween(from, to) ?? ''
  }

  selection.value = { from, to: from + linkText.length }

  return {
    text: linkText,
    href: linkMark?.attrs.href ?? '',
  }
}

function createLink() {
  if (!wysiwygStore.editor) {
    return
  }

  const { text = '', href = '' } = getSelectedLinkData() ?? {}

  link.value.url = href
  link.value.text = text
}

function unlink() {
  wysiwygStore.editor?.chain().focus().unsetLink().run()
  menuEl.value?.hide()
}

function handleSubmit() {
  const isLink = wysiwygStore.editor?.isActive('link')
  const moveTo = selection.value.from + link.value.text.length + 1

  if (isLink) {
    wysiwygStore.editor
      ?.chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: link.value.url })
      .insertContent(link.value.text)
      .run()
  } else {
    wysiwygStore.editor
      ?.chain()
      .focus()
      .insertContent(
        `<a href="${link.value.url}" data-uuid="${uuid}">${link.value.text}</a>&nbsp;`,
        // { parseOptions: { preserveWhitespace: true } },
      )
      .run()

    nextTick(() => {
      wysiwygStore.editor?.chain().focus().setTextSelection(moveTo).run()
    })
  }

  menuEl.value?.hide()
}

// Mentions
const urlEl = ref<any>()

const mentions = computedAsync(async () => {
  const mentionItems: IItem[] = []

  for await (const item of (wysiwygStore.mentionSetup ?? [])) {
    const res = item.loadData({})

    mentionItems.push(...res.data)
  }

  return mentionItems.flat()
})

function addTemplateVariable(mention: IItem) {
  link.value.url = `${link.value.url}{{${mention.id}}}`
}
</script>

<template>
  <Btn
    icon="i-ph:link"
    size="sm"
    color="ca"
    :class="{ 'is-active': wysiwygStore.editor?.isActive('link') }"
    @click.stop.prevent="createLink"
    @mousedown.stop.prevent
  >
    <Menu
      ref="menuEl"
      :no-arrow="false"
      w="100"
      @hide="reset"
    >
      <Form
        p="2"
        label-forced-visibility
        :submit-confirmation="false"
        no-shortcuts
        :ui="{ submitClass: '!w-auto', controlsClass: '!border-t-0' }"
        :submit-btn-props="{ size: 'sm', noUppercase: true }"
        @submit="handleSubmit"
      >
        <template #submit-start>
          <!-- Cancel link -->
          <Btn
            v-if="wysiwygStore.editor?.isActive('link')"
            :label="$t('general.cancelLink')"
            size="sm"
            color="negative"
            no-uppercase
            @click="unlink"
          />
        </template>

        <!-- Text -->
        <TextInput
          v-model="link.text"
          :label="$t('general.title')"
          placeholder="Google"
          autofocus
        />

        <!-- Url -->
        <TextArea
          ref="urlEl"
          v-model="link.url"
          :mask="{ mask: /^(?!.* ).*$/ }"
          :label="$t('general.link')"
          placeholder="https://google.com"
        >
          <template
            v-if="mentions?.length"
            #tooltip
          >
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
      </Form>
    </Menu>
  </Btn>
</template>
