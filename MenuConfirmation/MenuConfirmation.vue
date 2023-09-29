<script setup lang="ts">
// TYPES
import type { IMenuConfirmationProps } from '~/components/MenuConfirmation/types/menu-confirmation-props.type'

// COMPOSITION FUNCTIONS
import { useMenuUtils } from '~/components/Menu/functions/useMenuUtils'

// COMPONENTS
import Menu from '~/components/Menu/Menu.vue'
import Btn from '~/components/Button/Btn.vue'

const props = withDefaults(defineProps<IMenuConfirmationProps>(), {
  fit: false,
  contentClass: 'gap-y-3',
})
const emits = defineEmits<{
  (e: 'ok'): void
  (e: 'hide'): void
}>()

// UTILS
const { getMenuProps } = useMenuUtils()

// LAYOUT
const confirmBtnEl = ref<InstanceType<typeof Btn>>()
const isConfirmation = ref(false)

function handleConfirm() {
  emits('ok')

  if (!props.hasConfirmation) {
    menuEl.value?.hide()
  } else {
    isConfirmation.value = true

    nextTick(() => {
      menuEl.value?.update()
    })
  }
}

// MENU
const menuEl = ref<InstanceType<typeof Menu>>()
const menuProps = getMenuProps(props)

function handleMenuHide() {
  isConfirmation.value = false
  emits('hide')
}

defineExpose({
  focusConfirmButton: () => {
    const confirmBtnDom = unrefElement(confirmBtnEl)
    confirmBtnDom?.focus()
  },
  recomputeMenuPosition: () => menuEl.value?.recomputePosition(),
})
</script>

<template>
  <Menu
    ref="menuEl"
    v-bind="menuProps"
    min-w="60"
    :title="menuProps.title ?? $t('confirmAction')"
    @hide="handleMenuHide"
  >
    <slot name="prepend" />

    <slot
      :is-confirmation="isConfirmation"
      :hide="() => menuEl?.hide()"
    >
      <div
        bg="ca"
        rounded="custom"
        p="2"
        text="center"
      >
        {{ confirmationText || $t('confirmAction') }}
      </div>
    </slot>

    <slot name="append" />

    <Btn
      v-if="!isConfirmation"
      ref="confirmBtnEl"
      :label="$t('confirm')"
      bg="primary"
      color="white"
      @click="handleConfirm"
    />
  </Menu>
</template>
