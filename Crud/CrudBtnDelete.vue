<script setup lang="ts">
import type { CSSProperties } from 'vue'

// Types
import type { ICrudBtnProps } from '~/components/Crud/types/crud-btn-props.type'
import type { IMenuProps } from '~/components/Menu/types/menu-props.type'

defineProps<ICrudBtnProps & {
  confirmationText?: string
  menuProps?: IMenuProps & { class?: ClassType, style?: CSSProperties }
}>()
defineEmits<{
  (e: 'delete'): void
  (e: 'hide'): void
}>()
</script>

<template>
  <Btn
    preset="TRASH"
    :label="labels && (label || $t('general.delete'))"
    :loader-type
    :loading
    no-dim
    :size
    :outlined
    :no-uppercase
    :align
    :disabled
    :tooltip
    :tooltip-props
    :icon
    tabindex="-1"
    data-cy="delete-button"
    @click="noConfirm && $emit('delete')"
  >
    <MenuConfirmation
      v-if="!noConfirm"
      :title="$t('general.delete')"
      :confirmation-text
      placement="bottom-start"
      no-uplift
      no-overlay
      focus-confirm-button
      h="auto"
      v-bind="menuProps"
      @hide="$emit('hide')"
      @ok="$emit('delete')"
    >
      <slot name="confirmation" />
    </MenuConfirmation>

    <slot />
  </Btn>
</template>
