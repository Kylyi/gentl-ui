<script setup lang="ts">
type IProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  color?: string
}

const props = withDefaults(defineProps<IProps>(), {
  size: 'md',
  color: 'fill-primary',
})

const loaderClass = computedEager(() => {
  switch (props.size) {
    case 'xs':
      return 'h-5 w-10'

    case 'sm':
      return 'h-10 w-20'

    case 'md':
      return 'h-12 w-24'

    case 'lg':
      return 'h-16 w-32'

    case 'xl':
      return 'h-20 w-40'

    default:
      return `h-${props.size} w-${props.size}`
  }
})
</script>

<template>
  <svg
    id="L4"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    x="0px"
    y="0px"
    viewBox="0 0 100 100"
    enable-background="new 0 0 0 0"
    xml:space="preserve"
    data-cy="loader"
    :class="loaderClass"
  >
    <circle
      stroke="none"
      cx="0"
      cy="50"
      r="14"
      :class="color"
    >
      <animate
        attributeName="opacity"
        dur="1s"
        values="0;1;0"
        repeatCount="indefinite"
        begin="0.1"
      />
    </circle>

    <circle
      stroke="none"
      cx="50"
      cy="50"
      r="14"
      :class="color"
    >
      <animate
        attributeName="opacity"
        dur="1s"
        values="0;1;0"
        repeatCount="indefinite"
        begin="0.2"
      />
    </circle>

    <circle
      stroke="none"
      cx="100"
      cy="50"
      r="14"
      :class="color"
    >
      <animate
        attributeName="opacity"
        dur="1s"
        values="0;1;0"
        repeatCount="indefinite"
        begin="0.3"
      />
    </circle>
  </svg>
</template>
