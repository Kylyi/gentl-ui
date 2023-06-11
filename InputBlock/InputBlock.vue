<script setup lang="ts">
import { useMiniCardUtils } from '~/components/Card/functions/useMiniCardUtils'
import { IMiniCardProps } from '~/components/Card/types/mini-card-props.type'

const props = withDefaults(
  defineProps<IMiniCardProps & { editable?: boolean }>(),
  {
    emptyValueString: '-',
  }
)

// UTILS
const { getMiniCardProps } = useMiniCardUtils()

const miniCardProps = getMiniCardProps(props)

defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <MiniCard
    v-if="!editable"
    v-bind="{
      ...miniCardProps,
      ...$attrs,
    }"
  >
    <template #default="{ val }">
      <slot
        name="readonly"
        :val="val"
      />
    </template>
  </MiniCard>

  <slot v-else />
</template>
