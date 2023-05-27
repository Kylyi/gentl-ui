<script setup lang="ts">
import { IMiniCardProps } from '~/components/Card/types/mini-card-props.type'

defineProps<IMiniCardProps>()
</script>

<template>
  <div class="value-container-card">
    <span
      class="value-container-card-label"
      :class="labelClass"
    >
      {{ label }}
    </span>

    <ValueFormatter :value="value">
      <template #default="{ val }">
        <slot :val="val">
          <span
            class="value-container-card-value"
            :class="valueClass"
          >
            {{ val }}
          </span>
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
