<script setup lang="ts">
// Functions
import { stringToFloat } from '~/libs/Shared/regex/string-to-float.regex'

type Property =
  | 'padding'
  | 'colors'
  | 'border'
  | 'border-radius'
  | 'margin'
  | 'float'
  | 'size'

type IProps = {
  css: Record<string, string>
  properties?: Property[]
}

const props = defineProps<IProps>()

// Layout
const css = defineModel<IProps['css']>('css', { required: true })

const propertyByName = computed(() => {
  return props.properties?.reduce((agg, property) => {
    agg[property] = true

    return agg
  }, {} as Record<Property, boolean>)
})

const cssPadding = computed(() => {
  return {
    left: Number(stringToFloat(css.value['padding-left']) ?? 0),
    right: Number(stringToFloat(css.value['padding-right']) ?? 0),
    top: Number(stringToFloat(css.value['padding-top']) ?? 0),
    bottom: Number(stringToFloat(css.value['padding-bottom']) ?? 0),
  }
})

const cssSize = computed(() => {
  return {
    width: Number(stringToFloat(css.value.width) ?? 0),
    height: Number(stringToFloat(css.value.height) ?? 0),
  }
})

const cssMargin = computed({
  get() {
    const isCentered = css.value['margin-inline'] === 'auto'

    return isCentered
  },
  set(val) {
    setStyleValue('margin-inline', val ? 'auto' : 'unset')
  },
})

const cssBorder = computed(() => {
  return {
    width: Number(stringToFloat(css.value['border-width']) ?? 0),
    style: css.value['border-style'],
    color: css.value['border-color'],
    radius: Number(stringToFloat(css.value['border-radius']) ?? 0),
  }
})

function setStyleValue(key: string, value?: string | number | null) {
  if (!value) {
    css.value = omit(css.value, key)
  } else {
    css.value = {
      ...css.value,
      [key]: (typeof value === 'number' ? `${value}px` : value).trim(),
    }
  }
}
</script>

<template>
  <!-- Padding -->
  <Field
    v-if="propertyByName?.padding"
    :label="$t('style.padding')"
    control-class="flex gap-1 items-center !p-y-px !p-x-1"
    col="span-2"
  >
    <NumberInput
      :model-value="cssPadding.top"
      size="sm"
      no-border
      @update:model-value="setStyleValue('padding-top', $event)"
    >
      <template #prepend>
        <div class="i-material-symbols:arrow-back-rounded color-ca w-3 h-3 rotate-90" />
      </template>
    </NumberInput>

    <Separator vertical />

    <NumberInput
      :model-value="cssPadding.right"
      size="sm"
      no-border
      @update:model-value="setStyleValue('padding-right', $event)"
    >
      <template #prepend>
        <div class="i-material-symbols:arrow-back-rounded color-ca w-3 h-3 rotate-180" />
      </template>
    </NumberInput>

    <Separator vertical />

    <NumberInput
      :model-value="cssPadding.bottom"
      size="sm"
      no-border
      @update:model-value="setStyleValue('padding-bottom', $event)"
    >
      <template #prepend>
        <div class="i-material-symbols:arrow-back-rounded color-ca w-3 h-3 rotate-270" />
      </template>
    </NumberInput>

    <Separator vertical />

    <NumberInput
      :model-value="cssPadding.left"
      size="sm"
      no-border
      @update:model-value="setStyleValue('padding-left', $event)"
    >
      <template #prepend>
        <div class="i-material-symbols:arrow-back-rounded color-ca w-3 h-3" />
      </template>
    </NumberInput>
  </Field>

  <!-- Colors -->
  <Field
    v-if="propertyByName?.colors"
    :label="$t('style.colors')"
    control-class="grid cols-2 gap-1 items-center !p-1"
    col="span-2"
  >
    <ColorInput
      :model-value="css['background-color']"
      size="sm"
      icon="i-tabler:background"
      :no-icon="false"
      no-border
      :placeholder="$t('style.backgroundColor')"
      @update:model-value="setStyleValue('background-color', $event)"
    />

    <ColorInput
      :model-value="css.color"
      size="sm"
      icon="i-tabler:text-color"
      :no-icon="false"
      no-border
      :placeholder="$t('style.color')"
      @update:model-value="setStyleValue('color', $event)"
    />

    <span
      font="semibold rem-12"
      col="span-2"
      p="l-2 t-2"
      leading="tight"
    >
      {{ $t('style.hover') }}
    </span>

    <ColorInput
      :model-value="css['--hoverBg']"
      size="sm"
      icon="i-tabler:background"
      :no-icon="false"
      no-border
      :placeholder="$t('style.backgroundColor')"
      @update:model-value="setStyleValue('--hoverBg', $event)"
    />

    <ColorInput
      :model-value="css['--hoverColor']"
      size="sm"
      icon="i-tabler:text-color"
      :no-icon="false"
      no-border
      :placeholder="$t('style.color')"
      @update:model-value="setStyleValue('--hoverColor', $event)"
    />
  </Field>

  <!-- Border -->
  <Field
    v-if="propertyByName?.border"
    :label="$t('style.border')"
    control-class="flex gap-1 items-center !p-y-px !p-x-1"
    col="span-3"
  >
    <!-- Width -->
    <NumberInput
      :model-value="cssBorder.width"
      size="sm"
      no-border
      flex="basis-full"
      :placeholder="$t('style.borderWidth')"
      @update:model-value="setStyleValue('border-width', $event)"
    />

    <Separator vertical />

    <!-- Style -->
    <Selector
      :model-value="css['border-style']"
      size="sm"
      no-border
      emit-key
      :options="['solid', 'dashed', 'dotted', 'double', 'groove', 'inset', 'outset', 'ridge']"
      flex="basis-full"
      :placeholder="$t('style.borderStyle')"
      @update:model-value="setStyleValue('border-style', $event)"
    />

    <Separator vertical />

    <!-- Color -->
    <ColorInput
      :model-value="css['border-color']"
      size="sm"
      no-border
      flex="basis-full"
      :placeholder="$t('style.borderColor')"
      @update:model-value="setStyleValue('border-color', $event)"
    />
  </Field>

  <!-- Border radius -->
  <NumberInput
    v-if="propertyByName?.['border-radius']"
    :label="$t('style.borderRadius')"
    :model-value="cssBorder.radius"
    size="sm"
    @update:model-value="setStyleValue('border-radius', $event)"
  />

  <!-- Margin -->
  <Toggle
    v-if="propertyByName?.margin"
    v-model="cssMargin"
    :label="$t('style.marginXCentered')"
  />

  <!-- Float -->
  <Field
    v-if="propertyByName?.float"
    :label="$t('style.float')"
    control-class="flex items-center !p-y-2px !p-x-1"
    col="span-2"
  >
    <!-- Left -->
    <Btn
      size="sm"
      :label="$t('style.floatLeft')"
      class="group-btn"
      :rounded="false"
      :class="{ 'is-active': css.float === 'left' }"
      @click="setStyleValue('float', 'left')"
    />

    <!-- None -->
    <Btn
      size="sm"
      :label="$t('style.floatNone')"
      class="group-btn"
      :rounded="false"
      :class="{ 'is-active': css.float === 'none' }"
      @click="setStyleValue('float', 'none')"
    />

    <!-- Right -->
    <Btn
      size="sm"
      :label="$t('style.floatRight')"
      class="group-btn"
      :rounded="false"
      :class="{ 'is-active': css.float === 'right' }"
      @click="setStyleValue('float', 'right')"
    />
  </Field>

  <!-- Size -->
  <Field
    v-if="propertyByName?.size"
    :label="$t('style.size')"
    control-class="grid cols-2 gap-1 items-center !p-1"
    col="span-2"
  >
    <!-- Width -->
    <NumberInput
      :model-value="cssSize.width"
      size="sm"
      no-border
      @update:model-value="setStyleValue('width', $event)"
    >
      <template #prepend>
        <div class="i-ant-design:column-width-outlined color-ca w-3 h-3" />
      </template>
    </NumberInput>

    <!-- Height -->
    <NumberInput
      :model-value="cssSize.height"
      size="sm"
      no-border
      @update:model-value="setStyleValue('height', $event)"
    >
      <template #prepend>
        <div class="i-ant-design:column-height-outlined color-ca w-3 h-3" />
      </template>
    </NumberInput>
  </Field>
</template>

<style lang="scss" scoped>
.group-btn {
  @apply border-y-1 border-l-1 border-primary;

  &:first-child {
    @apply rounded-l-custom;
  }

  &:last-child {
    @apply rounded-r-custom border-r-1;
  }

  &.is-active {
    @apply bg-primary color-white;
  }
}
</style>
