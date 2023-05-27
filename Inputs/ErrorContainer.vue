<script setup lang="ts">
type IProps = {
  errorTakesSpace?: boolean
  errors?: Array<Pick<ErrorObject, '$message'> | string>
}

const props = withDefaults(defineProps<IProps>(), {
  errorTakesSpace: true,
})

// VALIDATION
const errorMessages = computed(() => {
  return props.errors
    ?.map(err => (typeof err === 'string' ? err : err.$message))
    .join('&nbsp; | &nbsp;')
})
</script>

<template>
  <!-- ERROR -->
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
