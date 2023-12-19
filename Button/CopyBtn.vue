<script setup lang="ts">
// Types
import { type IBtnProps } from '~/components/Button/types/btn-props.type'

const props = defineProps<
  IBtnProps & {
    modelValue?: any
    position?: 'left' | 'right' | 'top' | 'bottom'
  }
>()

// COPY
const { copy, copied, isSupported } = useClipboard({ copiedDuring: 2000 })

const copyBtnSize = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'xs'
    case 'sm':
      return 'xs'
    case 'md':
      return 'sm'
    case 'lg':
      return 'md'
    case 'auto':
    default:
      return 'auto'
  }
})

function handleCopy() {
  copy(String(props.modelValue))
}
</script>

<template>
  <Btn
    v-if="isSupported"
    :size="copyBtnSize"
    bg="white dark:darker"
    no-dim
    no-hover-effect
    outline="1px"
    :class="[
      copied
        ? '!outline-positive !outline-solid'
        : '!outline-dotted !outline-ca',
    ]"
    @click="handleCopy"
  >
    <template #icon>
      <div
        v-if="!copied"
        bx:copy
        class="icon"
      />
      <Checkmark
        v-else
        class="icon"
      />
    </template>

    <BtnConfirmation
      :model-value="copied"
      :position="position"
      :label="$t('copied')"
    />
  </Btn>
</template>

<style lang="scss" scoped>
.btn {
  .icon {
    --apply: w-4 h-4 color-ca;
  }

  &--xs {
    .icon {
      --apply: w-3 h-3 m-x-2px;
    }
  }

  &--sm {
    .icon {
      --apply: w-3.5 h-3.5 m-x-2px;
    }
  }

  &--md {
    .icon {
      --apply: w-4.5 h-4.5 m-x-2px;
    }
  }
}
</style>
