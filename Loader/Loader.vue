<script setup lang="ts">
import LoaderBlock from '~/components/Loader/LoaderBlock.vue'
import LoaderInline from '~/components/Loader/LoaderInline.vue'

type IProps = {
  type?: 'inline' | 'block'
}

const props = withDefaults(defineProps<IProps>(), {
  type: 'block',
})

const LoaderComponent = props.type === 'inline' ? LoaderInline : LoaderBlock
</script>

<template>
  <component
    :is="LoaderComponent"
    v-bind="$attrs"
  />
</template>
