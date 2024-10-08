<script setup lang="ts">
// Types
import type { IMenuConfirmationProps } from '~/components/MenuConfirmation/types/menu-confirmation-props.type'

// Functions
import { useMenuUtils } from '~/components/Menu/functions/useMenuUtils'

// Components
import type Menu from '~/components/Menu/Menu.vue'
import Btn from '~/components/Button/Btn.vue'

const props = withDefaults(defineProps<IMenuConfirmationProps>(), {
  fit: false,
  contentClass: 'gap-y-3',
})
const emits = defineEmits<{
  (e: 'ok'): void
  (e: 'hide'): void
}>()

// Utils
const { getMenuProps } = useMenuUtils()

// Layout
const confirmBtnEl = ref<InstanceType<typeof Btn>>()
const isConfirmation = ref(false)

function handleConfirm() {
  emits('ok')

  if (!props.hasConfirmation) {
    menuEl.value?.hide()
  } else {
    isConfirmation.value = true

    nextTick(() => {
      menuEl.value?.recomputePosition(true)
    })
  }
}

// Menu
const menuEl = ref<InstanceType<typeof Menu>>()
const menuProps = getMenuProps(props)

function handleMenuHide() {
  isConfirmation.value = false
  emits('hide')
}

function handleMenuShow() {
  if (props.focusConfirmButton) {
    focusConfirmButton()
  }
}

function focusConfirmButton() {
  const confirmBtnDom = unrefElement(confirmBtnEl)
  confirmBtnDom?.focus()
}

defineExpose({
  focusConfirmButton,
  recomputeMenuPosition: () => menuEl.value?.recomputePosition(),
  hide: () => menuEl.value?.hide(),
  show: () => menuEl.value?.show(),
})
</script>

<template>
  <MenuProxy
    ref="menuEl"
    v-bind="menuProps"
    min-w="60"
    position="top"
    :title="menuProps.title ?? $t('general.confirmAction')"
    @show="handleMenuShow"
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
        {{ confirmationText || $t('general.confirmAction') }}
      </div>
    </slot>

    <slot name="append" />

    <Btn
      v-if="!isConfirmation && !noConfirmBtn"
      ref="confirmBtnEl"
      :label="$t('general.confirm')"
      bg="primary"
      color="white"
      data-cy="confirm-delete"
      :class="ui?.confirmBtnClass"
      @click="handleConfirm"
    />
  </MenuProxy>
</template>
