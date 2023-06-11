<script setup lang="ts">
import { IMiniCardProps } from '~/components/Card/types/mini-card-props.type'
import { useValueFormatterUtils } from '~/components/ValueFormatter/functions/useValueForamtterUtils'

const props = defineProps<IMiniCardProps>()

// UTILS
const { getValueFormatterProps } = useValueFormatterUtils()

const valueFormatterProps = getValueFormatterProps(props)

// LAYOUT
function getShownValue(val: any) {
  if (isNil(val) || val === '' || (Array.isArray(val) && val.length === 0)) {
    return props.emptyValueString
  }

  return val
}
</script>

<template>
  <div class="value-container-card">
    <span
      class="value-container-card-label"
      :class="labelClass"
    >
      {{ label }}
    </span>

    <ValueFormatter v-bind="valueFormatterProps">
      <template #default="{ val }">
        <slot :val="val">
          <span
            v-if="!to || !val"
            class="value-container-card-value"
            :class="valueClass"
          >
            {{ getShownValue(val) }}
          </span>

          <NuxtLink
            v-else
            :to="to"
            class="link"
          >
            {{ getShownValue(val) }}
          </NuxtLink>
        </slot>
      </template>
    </ValueFormatter>
  </div>
</template>

<style scoped lang="scss">
.value-container-card {
  --apply: flex flex-col rounded-custom p-x-2 p-y-1 flex-gap-1;

  &-label {
    --apply: text-caption;
  }

  &-value {
    --apply: font-bold;

    overflow-wrap: break-word;
  }
}
</style>
