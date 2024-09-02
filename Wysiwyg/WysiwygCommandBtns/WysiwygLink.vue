<script setup lang="ts">
// Store
import { useWysiwygStore } from '~/components/Wysiwyg/wysiwyg.store'

// Components
import Menu from '~/components/Menu/Menu.vue'

// Store
const { editor } = useWysiwygStore()

// Layout
const menuEl = ref<InstanceType<typeof Menu>>()
const { model: link, reset: linkReset } = useRefReset({ url: '', text: '' })
const { model: selection, reset: posReset } = useRefReset({ from: 0, to: 0 })

function reset() {
  linkReset()
  posReset()
}

function getSelectedLinkData() {
  const state = editor?.state

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
  if (!editor) {
    return
  }

  const { text = '', href = '' } = getSelectedLinkData() ?? {}

  link.value.url = href
  link.value.text = text
}

function unlink() {
  editor?.chain().focus().unsetLink().run()
  menuEl.value?.hide()
}

function handleSubmit() {
  const isLink = editor?.isActive('link')
  const moveTo = selection.value.from + link.value.text.length + 1

  if (isLink) {
    editor
      ?.chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: link.value.url })
      .insertContent(link.value.text)
      .run()
  } else {
    editor
      ?.chain()
      .focus()
      .insertContent(
        `<a href="${link.value.url}" class="link" data-uuid="${uuid}">${link.value.text}</a>&nbsp;`,
        // { parseOptions: { preserveWhitespace: true } },
      )
      .run()

    nextTick(() => {
      editor?.chain().focus().setTextSelection(moveTo).run()
    })
  }

  menuEl.value?.hide()
}
</script>

<template>
  <Btn
    icon="i-ph:link"
    size="sm"
    color="ca"
    :class="{ 'is-active': editor?.isActive('link') }"
    @click.stop.prevent="createLink"
    @mousedown.stop.prevent
  >
    <Menu
      ref="menuEl"
      :no-arrow="false"
      w="70"
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
            v-if="editor?.isActive('link')"
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
          label-inside
          placeholder="Google"
          autofocus
        />

        <!-- Url -->
        <TextInput
          v-model="link.url"
          :label="$t('general.link')"
          placeholder="https://google.com"
          label-inside
        />
      </Form>
    </Menu>
  </Btn>
</template>
