<script setup lang="ts">
// Injections
import { editorKey } from '~/components/Wysiwyg/provide/wysiwyg.provide'

// Components
import Menu from '~/components/Menu/Menu.vue'

// Layout
const editor = inject(editorKey)
const menuEl = ref<InstanceType<typeof Menu>>()
const link = ref({
  url: '',
  text: '',
})

function reset() {
  link.value = {
    url: '',
    text: '',
  }
}

function createLink() {
  const _editor = toValue(editor)

  if (!_editor) {
    return
  }

  const { href } = _editor.getAttributes('link') ?? {}
  const { selection } = _editor.state
  const linkNode = _editor.view.state.doc.nodeAt(selection.$from.pos)

  link.value.url = href ?? ''
  link.value.text = linkNode?.text ?? ''
}

function unlink() {
  toValue(editor)?.chain().focus().unsetLink().run()
  menuEl.value?.hide()
}

function handleSubmit() {
  toValue(editor)
    ?.chain()
    .focus()
    .insertContent(
      `<a href="${link.value.url}" class="link">${link.value.text}</a>&nbsp;`,
      {
        parseOptions: {
          preserveWhitespace: true,
        },
      }
    )
    .run()

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
        @submit="handleSubmit"
      >
        <template #submit-start>
          <Btn
            v-if="editor?.isActive('link')"
            preset="CLOSE"
            :label="$t('general.cancel')"
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
