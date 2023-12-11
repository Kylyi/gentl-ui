<script setup lang="ts">
// Types
import { type IMiniCardProps } from '~/components/Card/types/mini-card-props.type'

// Functions
import { useValueFormatterUtils } from '~/components/ValueFormatter/functions/useValueForamtterUtils'

const props = withDefaults(defineProps<IMiniCardProps>(), {
  originalValue: undefined,
})

// Utils
const { getValueFormatterProps } = useValueFormatterUtils()

const valueFormatterProps = getValueFormatterProps(props)

// Layout
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
      <div
        class="value-container-card-label"
        :class="labelClass"
      >
        {{ label }}
      </div>

      <ValueFormatter v-bind="valueFormatterProps">
        <template #default="{ val }">
          <slot :val="val">
            <!-- Current value -->
            <span
              v-if="!to || !val"
              class="value-container-card__value"
              :class="[valueClass, { 'font-bold': !noBold }]"
            >
              {{ getShownValue(val) }}
            </span>

            <NuxtLink
              v-else
              :to="to"
              class="link"
              :class="[valueClass, { 'font-bold': !noBold }]"
            >
              <span class="link__label">
                <span class="link__label-icon" />
                {{ getShownValue(val) }}
              </span>
            </NuxtLink>
          </slot>
        </template>

        <!-- Orginal Value -->
        <template
          v-if="originalValue !== undefined"
          #originalValue="{ val }"
        >
          <div m-t-2>
            <span
              v-if="!toOriginalValue || !val"
              class="value-container-card__value text-purple-500"
              :class="[originalValueClass, { 'font-bold': !noBold }]"
            >
              {{ getShownValue(val) }}
            </span>

            <NuxtLink
              v-else
              :to="toOriginalValue"
              class="link"
              :class="[originalValueClass, { 'font-bold': !noBold }]"
              text-purple-500
            >
              <span class="link__label">
                <span class="link__label-icon" />
                <span>{{ getShownValue(val) }}</span>
              </span>
            </NuxtLink>
          </div>
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

  &-label {
    --apply: text-caption color-$MiniCard-label-color font-size-$MiniCard-label-font-size p-b-1;
  }

  &__value {
    --apply: text-sm font-size-$MiniCard-value-font-size;
    overflow-wrap: break-word;
    font-weight: var(--MiniCard-value-font-weight);
    white-space: pre-line;
  }

  &__content {
    --apply: w-full leading-4.5;
  }

  .link {
    --apply: decoration-none font-size-$MiniCard-value-font-size text-sm;
    font-weight: var(--MiniCard-value-font-weight);

    &__label{
      --apply: relative;

      &::before{
        --apply: content-empty inline-block w-4 min-w-4;
      }

      &:hover {
        --apply: color-blue-500 dark:color-blue-700;

        background-image: linear-gradient(to bottom, transparent 0%, transparent calc(100% - 1px), theme('colors.blue.500') calc(100% - 1px), theme('colors.blue.500') 100%);
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-position: 0% 100%;
      }

      &-icon{
        // top-0.4 makes the icon align with text, no deeper meaning
        --apply: ph:link min-h-4 h-4 min-w-4 w-4 absolute left-0 top-0.4;
      }
    }
  }
}

.dark{
    .link{
      &__label{
        &:hover{
          background-image: linear-gradient(to bottom, transparent 0%, transparent calc(100% - 1px), theme('colors.blue.700') calc(100% - 1px), theme('colors.blue.700') 100%);
          background-size: 100% 100%;
          background-repeat: no-repeat;
          background-position: 0% 100%;
        }
      }
    }
  }
</style>
