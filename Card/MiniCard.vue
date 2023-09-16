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
    <div
      v-if="$slots.icon || icon"
      class="value-container-card__icon color-primary"
    >
      <slot name="icon">
        <div
          v-if="icon"
          :class="icon"
          class="h-6 w-6"
        />
      </slot>
    </div>

    <div class="value-container-card__content">
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
              :class="[valueClass, { 'font-bold': !noBold }]"
            >
              {{ getShownValue(val) }}
            </span>

            <NuxtLink
              v-else
              :to="to"
              class="link text-sm"
              :class="[valueClass, { 'font-bold': !noBold }]"
            >
              <span class="link_icon" />
              {{ getShownValue(val) }}
            </NuxtLink>
          </slot>
        </template>
      </ValueFormatter>
    </div>
  </div>
</template>

<style scoped lang="scss">
.value-container-card {
  --apply: flex rounded-custom p-x-2 p-y-1 flex-gap-2;

  &__icon {
    --apply: shrink-0 m-t-.5;
  }

  &__content {
    --apply: flex flex-col flex-gap-1;
  }

  &-label {
    --apply: text-caption;
    color: var(--MiniCard-label-color);
    font-size: var(--MiniCard-label-font-size);
  }

  &-value {
    --apply: text-sm;
    overflow-wrap: break-word;
    font-size: var(--MiniCard-value-font-size);
    font-weight: var(--MiniCard-value-font-weight);
  }
  .link {
    --apply: decoration-none flex items-center;
    font-size: var(--MiniCard-value-font-size);
    font-weight: var(--MiniCard-value-font-weight);

    &_icon{
      --apply: ph:link h-4 w-4 m-r-1 inline-block;
    }
  }
}
</style>
