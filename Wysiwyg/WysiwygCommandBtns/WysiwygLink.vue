<script setup lang="ts">
import { Editor } from '@tiptap/vue-3'

// Components
import Menu from '~/components/Menu/Menu.vue'

type IProps = {
  editor: Editor
}

const props = defineProps<IProps>()

// Layout
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
  const { href } = props.editor.getAttributes('link') ?? {}
  const { selection } = props.editor.state
  const linkNode = props.editor.view.state.doc.nodeAt(selection.$from.pos)

  link.value.url = href ?? ''
  link.value.text = linkNode?.text ?? ''
}

function unlink() {
  props.editor.chain().focus().unsetLink().run()
  menuEl.value?.hide()
}

function handleSubmit() {
  props.editor
    .chain()
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
    icon="ph:link"
    size="sm"
    color="ca"
    :class="{ 'is-active': editor.isActive('link') }"
    @click.stop.prevent="createLink"
    @mousedown.stop.prevent
  >
    <Menu
      ref="menuEl"
      hide-header
      :no-arrow="false"
      dense
      w="70"
      content-class="flex flex-col gap-2 rounded-custom"
      @hide="reset"
    >
      <Form
        p="2"
        label-forced-visibility
        @submit="handleSubmit"
      >
        <template #submit-start>
          <Btn
            v-if="editor.isActive('link')"
            preset="CLOSE"
            :label="$t('general.cancel')"
            @click="unlink"
          />
        </template>

        <!-- Text -->
        <TextInput
          v-model="link.text"
          :label="$t('name')"
          label-inside
          placeholder="Google"
          autofocus
        />

        <!-- Url -->
        <TextInput
          v-model="link.url"
          :label="$t('wysiwyg.link')"
          placeholder="https://google.com"
          label-inside
        />
      </Form>
    </Menu>
  </Btn>
</template>
