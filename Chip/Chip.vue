<script setup lang="ts">
// Types
import type { IChipProps } from '~~/components/Chip/types/chip-props.type'

// Directives
import { vRipple } from '~~/libs/App/directives/ripple'

const props = defineProps<IChipProps>()
defineEmits<{
  (e: 'remove'): void
}>()

// UTILS
function handleClick() {
  if (props.to) {
    $nav(props.to)
  }
}
</script>

<template>
  <div
    v-ripple="ripple"
    class="chip"
    border="ca"
    h="5"
    :class="[
      hasRemove ? 'p-r-1' : 'p-r-2',
      {
        'cursor-pointer': !!to || !!ripple,
        '!overflow-visible': hasCopy,
      },
    ]"
    @click="handleClick"
  >
    <div
      v-if="icon"
      :class="icon"
    />

    <CopyBtn
      v-if="hasCopy"
      :model-value="label"
      size="auto"
      color="ca"
      h="4"
      w="4"
      m="x-1"
      position="bottom"
    />

    <div
      class="chip-label"
      :class="[labelClass, { 'justify-center': center }]"
    >
      <slot>
        <span truncate>
          {{ label }}
        </span>
      </slot>
    </div>

    <Btn
      v-if="hasRemove"
      icon="eva:close-fill !w-4 !h-4"
      size="auto"
      color="ca"
      h="4"
      w="4"
      self-center
      :rounded="false"
      class="rounded"
      @click.stop.prevent="$emit('remove')"
      @mousedown.stop.prevent
    />
  </div>
</template>

<style lang="scss" scoped>
.chip {
  --apply: flex flex-gap-1 p-y-3px p-l-2 border-px rounded truncate relative
    leading-tight items-center self-center;

  &-label {
    --apply: flex flex-gap-x-2 flex-1 truncate font-rem-14;
  }
}
</style>
