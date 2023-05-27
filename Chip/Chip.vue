<script setup lang="ts">
// TYPES
import type { IChipProps } from '~~/components/Chip/types/chip-props.type'

// DIRECTIVES
import { vRipple } from '~~/libs/App/directives/ripple'

const props = defineProps<IChipProps>()
defineEmits<{
  (e: 'remove'): void
}>()

// UTILS
function handleClick() {
  if (props.to) {
    navigateTo(props.to)
  }
}
</script>

<template>
  <div
    v-ripple="ripple"
    class="chip"
    h="5"
    :class="[
      hasRemove ? 'p-r-1' : 'p-r-2',
      { 'cursor-pointer': !!to || !!ripple },
    ]"
    @click="handleClick"
  >
    <div
      v-if="icon"
      :class="icon"
    />

    <div
      class="chip-label"
      :class="{ 'justify-center': center }"
    >
      <span truncate>
        {{ label }}
      </span>
      <slot />
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
  --apply: flex flex-gap-1 p-y-3px p-l-2 border-1 border-ca rounded truncate
    select-none relative leading-tight items-center self-center;

  &-label {
    --apply: flex flex-1 truncate font-rem-14;
  }
}
</style>
