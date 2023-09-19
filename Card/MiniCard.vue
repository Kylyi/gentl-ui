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
      class="value-container-card__icon color-$MiniCard-icon-color"
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
              <span class="link_label">
                <span class="link_label__icon" />
                {{ getShownValue(val) }}
              </span>
            </NuxtLink>
          </slot>
        </template>
      </ValueFormatter>
    </div>
  </div>
</template>

<style scoped lang="scss">
$slate-400-hex: #94a3b8;
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
    --apply: decoration-none items-center;
    font-size: var(--MiniCard-value-font-size);
    font-weight: var(--MiniCard-value-font-weight);

    &_label{
      display: inline;
      position: relative;
      line-height: 18px;

      &::before{
        content: "";
        width: 20px;
        display: inline-block;
      }

      &:hover {
        --apply: color-blue-500 dark:color-blue-700;
        background-image: linear-gradient(to bottom, transparent 0%, transparent calc(100% - 1px), $slate-400-hex calc(100% - 1px), $slate-400-hex 100%);
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-position: 0% 100%;

      }

      &__icon{
        --apply: ph:link min-h-4 h-4 min-w-4 w-4;
        position: absolute;
        left: 0;
      }
    }

  }
}
</style>
