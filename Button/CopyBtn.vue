<script setup lang="ts">
// TYPES
import { IBtnProps } from '~/components/Button/types/btn-props.type'

const props = defineProps<IBtnProps & { modelValue?: any }>()

// COPY
const { copy, copied } = useClipboard({ copiedDuring: 2000 })

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
      return 'sm'
  }
})

function handleCopy() {
  copy(String(props.modelValue))
}
</script>

<template>
  <Btn
    :size="copyBtnSize"
    bg="white dark:darker"
    m="x-2"
    no-dim
    no-hover-effect
    outline="1px"
    :class="[
      copied
        ? '!outline-positive !outline-solid'
        : '!outline-dashed !outline-ca',
    ]"
    @click.stop.prevent="handleCopy"
    @mousedown.stop.prevent
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
