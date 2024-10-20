<script setup lang="ts">
type Property =
  | 'table-separator'

type IProps = {
  properties?: Property[]
  classes: string[]
}

const props = defineProps<IProps>()

// Layout
const classes = defineModel<IProps['classes']>('classes', { required: true })

const propertyByName = computed(() => {
  return props.properties?.reduce((agg, property) => {
    agg[property] = true

    return agg
  }, {} as Record<Property, boolean>)
})

function setSeparatorClass(value: string) {
  const separatorClasses = [
    'separator-both',
    'separator-none',
    'separator-rows',
    'separator-cols',
  ]

  classes.value = [
    ...classes.value
      .filter(c => !separatorClasses.includes(c))
      .filter(Boolean),
    value,
  ]
}
</script>

<template>
  <!-- Table separator -->
  <Field
    v-if="propertyByName?.['table-separator']"
    :label="$t('wysiwyg.tableSeparator')"
    control-class="flex items-center !p-y-1 !p-x-1"
    col="span-2"
  >
    <Btn
      size="sm"
      no-uppercase
      class="group-btn"
      :rounded="false"
      :class="{ 'is-active': classes.includes('separator-none') }"
      :label="$t('wysiwyg.table.separatorNone')"
      @click="setSeparatorClass('separator-none')"
    />

    <Btn
      size="sm"
      no-uppercase
      class="group-btn"
      :rounded="false"
      :class="{ 'is-active': classes.includes('separator-both') }"
      :label="$t('wysiwyg.table.separatorBoth')"
      @click="setSeparatorClass('separator-both')"
    />

    <Btn
      size="sm"
      no-uppercase
      class="group-btn"
      :rounded="false"
      :class="{ 'is-active': classes.includes('separator-rows') }"
      :label="$t('wysiwyg.table.separatorRows')"
      @click="setSeparatorClass('separator-rows')"
    />

    <Btn
      size="sm"
      no-uppercase
      class="group-btn"
      :rounded="false"
      :class="{ 'is-active': classes.includes('separator-cols') }"
      :label="$t('wysiwyg.table.separatorColumns')"
      @click.stop.prevent="setSeparatorClass('separator-cols')"
    />
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
