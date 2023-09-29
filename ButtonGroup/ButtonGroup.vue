<script setup lang="ts">
// TYPES
import type { IButtonGroupProps } from '~/components/ButtonGroup/types/button-group-props.type'

withDefaults(defineProps<IButtonGroupProps>(), {
  activeClass: 'bg-primary color-white',
})
</script>

<template>
  <div class="btn-group">
    <Btn
      v-for="(btn, idx) in buttons"
      :key="idx"
      :label="btn.label"
      :icon="btn.icon"
      :class="[modelValue === btn.value ? activeClass : btn.class]"
    >
      <template #default>
        <slot :name="btn.value" />
      </template>
    </Btn>
  </div>
</template>

<style lang="scss" scoped>
.btn-group {
  --apply: flex rounded-full;
}
</style>
