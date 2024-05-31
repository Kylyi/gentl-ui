<script setup lang="ts">
// Injections
import { useWysiwygInjections } from '~/components/Wysiwyg/functions/useWysiwygInjections'

// Utils
const { wysiwygAddFiles } = useWysiwygInjections()

// Layout
const files = ref<File[]>([])

function handleSubmit() {
  wysiwygAddFiles(files.value)

  $hide()
}
</script>

<template>
  <Btn
    icon="i-material-symbols:attachment"
    size="sm"
    color="ca"
    @click.stop.prevent
    @mousedown.stop.prevent
  >
    <Dialog
      h="auto"
      w="200"
      :title="$t('general.uploadFile', 2)"
      @hide="files = []"
    >
      <Form @submit="handleSubmit">
        <FileInput
          v-model="files"
          multi
        />
      </Form>
    </Dialog>
  </Btn>
</template>
