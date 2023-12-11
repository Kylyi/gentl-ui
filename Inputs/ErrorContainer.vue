<script setup lang="ts">
type IProps = {
  errorTakesSpace?: boolean
  errors?: string[]
}

const props = withDefaults(defineProps<IProps>(), {
  errorTakesSpace: true,
})

// Validation
const errorMessages = computed(() => {
  return props.errors?.join('&nbsp; | &nbsp;')
})
</script>

<template>
  <Collapse
    :model-value="!!errors?.length"
    no-header
    :padded="false"
    :is-floating="!errorTakesSpace"
  >
    <div
      inline-block
      p="b-1"
      transition="height duration-150"
      color="negative"
    >
      <div
        m="r-2"
        ci:error
        class="inline-block align-middle"
      />
      <span
        class="align-middle"
        font="rem-12"
        v-html="errorMessages"
      />
    </div>
  </Collapse>
</template>
