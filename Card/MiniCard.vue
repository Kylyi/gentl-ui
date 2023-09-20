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
$blue-500-hex: #3b82f6;
$blue-700-hex: #1d4ed8;
.value-container-card {
  --apply: flex rounded-custom p-x-2 p-y-1 flex-gap-2;

  &__icon {
    --apply: shrink-0 m-t-.5;
  }

  &__content {
    --apply: flex flex-col flex-gap-1;
  }

  &-label {
    --apply: text-caption color-$MiniCard-label-color font-size-$MiniCard-label-font-size;
  }

  &-value {
    --apply: text-sm font-size-$MiniCard-value-font-size;
    overflow-wrap: break-word;
    font-weight: var(--MiniCard-value-font-weight);
  }

  .link {
    --apply: decoration-none items-center font-size-$MiniCard-value-font-size;
    font-weight: var(--MiniCard-value-font-weight);

    &_label{
      --apply: inline relative lh-4.5;

      &::before{
        --apply: content-empty inline-block w-4 min-w-4;
      }

      &:hover {
        --apply: color-blue-500 dark:color-blue-700;

        background-image: linear-gradient(to bottom, transparent 0%, transparent calc(100% - 1px), $blue-500-hex calc(100% - 1px), $blue-500-hex 100%);
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-position: 0% 100%;
      }

      &__icon{
        --apply: ph:link min-h-4 h-4 min-w-4 w-4 absolute left-0 top-0.4;
      }
    }
  }
}

.dark{
    .link{
      &_label{
        &:hover{
          background-image: linear-gradient(to bottom, transparent 0%, transparent calc(100% - 1px), $blue-700-hex calc(100% - 1px), $blue-700-hex 100%);
          background-size: 100% 100%;
          background-repeat: no-repeat;
          background-position: 0% 100%;
        }
      }
    }
  }
</style>
