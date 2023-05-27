<script setup lang="ts">
import { Editor } from '@tiptap/vue-3'

type IProps = {
  editor: Editor
}

const props = defineProps<IProps>()
defineEmits<{
  (e: 'set-heading', payload: { isHeading: boolean; level?: 4 | 5 | 6 }): void
}>()

function isActive(level?: number) {
  return props.editor.isActive('heading', { ...(level && { level }) })
}
</script>

<template>
  <div flex="~ gap-x-1">
    <Btn
      :label="$t('h1')"
      size="sm"
      color="ca"
      :class="{ 'is-active': isActive(4) }"
      @click.stop.prevent="$emit('set-heading', { isHeading: true, level: 4 })"
      @mousedown.stop.prevent
    />
    <Btn
      :label="$t('h2')"
      size="sm"
      color="ca"
      :class="{ 'is-active': isActive(5) }"
      @click.stop.prevent="$emit('set-heading', { isHeading: true, level: 5 })"
      @mousedown.stop.prevent
    />
    <Btn
      :label="$t('h3')"
      size="sm"
      color="ca"
      :class="{ 'is-active': isActive(6) }"
      @click.stop.prevent="$emit('set-heading', { isHeading: true, level: 6 })"
      @mousedown.stop.prevent
    />
    <Btn
      :label="$t('text')"
      size="sm"
      color="ca"
      :class="{ 'is-active': !isActive() }"
      @click.stop.prevent="$emit('set-heading', { isHeading: false })"
      @mousedown.stop.prevent
    />
  </div>
</template>
