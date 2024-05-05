<script setup lang="ts">
// Types
import type { IInputWrapperProps } from '../Inputs/types/input-wrapper-props.type'
import type { IMiniCardProps } from '~/components/Card/types/mini-card-props.type'

// Functions
import { useMiniCardUtils } from '~/components/Card/functions/useMiniCardUtils'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<IInputBlockProps>(), {
  emptyValueString: '-',
})

type IInputBlockProps = IMiniCardProps & {
  editable?: boolean
  validation?: IInputWrapperProps['validation']
  name?: string
}

// Utils
const { getMiniCardProps } = useMiniCardUtils()

const miniCardProps = getMiniCardProps(props)

// Validation
const validation = toRef(props, 'validation')

const path = computed(() => {
  return Array.isArray(validation.value)
    ? validation.value.map(item => item?.$path).join('.')
    : validation.value?.$path
})
</script>

<template>
  <MiniCard
    v-if="!editable"
    :name="name || path"
    v-bind="{ ...miniCardProps, ...$attrs }"
    bg="white dark:darker"
  >
    <template #default="{ val }">
      <slot
        name="readonly"
        :val="val"
      />
    </template>
  </MiniCard>

  <div
    v-else
    flex="~ items-center"
    :name="name || path"
    v-bind="$attrs"
  >
    <div
      v-if="miniCardProps.icon"
      class="icon"
      :class="miniCardProps.icon"
    />
    <div flex-grow-1>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.icon {
  --apply: h-6 w-6 translate-y-2 m-r-3;
  --apply: color-$Collapse-dropdown-icon-color;
}
</style>
