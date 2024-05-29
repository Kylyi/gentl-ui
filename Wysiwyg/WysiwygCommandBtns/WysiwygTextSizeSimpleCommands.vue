<script setup lang="ts">
// Injections
import { editorKey } from '~/components/Wysiwyg/provide/wysiwyg.provide'

// Layout
const editor = inject(editorKey)

function isActive(level?: number) {
  return toValue(editor)?.isActive('heading', { ...(level && { level }) })
}

function handleSetHeading(payload: { isHeading: boolean; level?: number }) {
  const { isHeading, level } = payload

  if (isHeading) {
    toValue(editor)
      ?.chain()
      .focus()
      .setHeading({ level: (level as any) ?? 6 })
      .run()
  } else {
    toValue(editor)?.chain().focus().setParagraph().run()
  }
}
</script>

<template>
  <div flex="~ gap-x-1">
    <!-- H1 -->
    <Btn
      :label="$t('h1')"
      size="sm"
      color="ca"
      :class="{ 'is-active': isActive(4) }"
      @click.stop.prevent="handleSetHeading({ isHeading: true, level: 4 })"
      @mousedown.stop.prevent
    />

    <!-- H2 -->
    <Btn
      :label="$t('h2')"
      size="sm"
      color="ca"
      :class="{ 'is-active': isActive(5) }"
      @click.stop.prevent="handleSetHeading({ isHeading: true, level: 5 })"
      @mousedown.stop.prevent
    />

    <!-- H3 -->
    <Btn
      :label="$t('h3')"
      size="sm"
      color="ca"
      :class="{ 'is-active': isActive(6) }"
      @click.stop.prevent="handleSetHeading({ isHeading: true, level: 6 })"
      @mousedown.stop.prevent
    />

    <!-- Regular -->
    <Btn
      :label="$t('text')"
      size="sm"
      color="ca"
      :class="{ 'is-active': !isActive() }"
      @click.stop.prevent="handleSetHeading({ isHeading: false })"
      @mousedown.stop.prevent
    />
  </div>
</template>
