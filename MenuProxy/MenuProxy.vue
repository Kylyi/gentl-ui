<script setup lang="ts">
// Types
import type { IMenuProps } from '~/components/Menu/types/menu-props.type'
import type { IDialogProps } from '~/components/Dialog/types/dialog-props.type'

// Components
import Dialog from '~/components/Dialog/Dialog.vue'
import Menu from '~/components/Menu/Menu.vue'

type IProps = {
  breakpoint?: keyof typeof BREAKPOINTS
} & IDialogProps &
  IMenuProps

const props = withDefaults(defineProps<IProps>(), {
  breakpoint: 'sm',
  offset: 8,
  maxHeight: 99999,
  noArrow: true,
  fit: true,
  noOverlay: true,
  transitionDuration: 250,
})

const emits = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'hide'): void
  (e: 'show'): void
  (e: 'before-hide'): void
  (e: 'before-show'): void
}>()

// LAYOUT
const menuProxyEl = ref<InstanceType<typeof Menu | typeof Dialog>>()
const model = useVModel(props, 'modelValue', emits)
const internalValue = ref(model.value)

const isMenu = computedEager(() => $bp[props.breakpoint].value)

// The `val` is actually boolean, but Vue can't infer that because the component is dynamic
function propagateModelValue(val: any) {
  internalValue.value = val
  emits('update:modelValue', val)
}

watch(
  model,
  val => {
    if (typeof val === 'boolean') {
      internalValue.value = val
    }
  },
  { immediate: true }
)

defineExpose({
  show: () => menuProxyEl.value?.show(),
  hide: (force?: boolean, skipAnimation?: boolean) => {
    menuProxyEl.value?.hide(force, skipAnimation)
  },
  toggle: (state: boolean | MouseEvent) => menuProxyEl.value?.toggle(state),
  setInternalValue: (val: boolean) => {
    internalValue.value = val
  },
  recomputePosition: () => {
    if (menuProxyEl.value && 'recomputePosition' in menuProxyEl.value) {
      menuProxyEl.value?.recomputePosition()
    }
  },
  getFloatingEl: () => menuProxyEl.value?.getFloatingEl(),
})
</script>

<template>
  <Component
    :is="isMenu ? Menu : Dialog"
    ref="menuProxyEl"
    v-bind="$props"
    v-model="internalValue"
    @update:model-value="propagateModelValue"
    @hide="emits('hide')"
    @show="emits('show')"
    @before-hide="emits('before-hide')"
    @before-show="emits('before-show')"
  >
    <template #title>
      <slot name="title" />
    </template>

    <template #header-right-prepend>
      <slot name="header-right-prepend" />
    </template>

    <template #header-right-append>
      <slot name="header-right-append" />
    </template>

    <template #header="{ hide }">
      <slot
        name="header"
        :hide="hide"
      />
    </template>

    <template #default>
      <slot />
    </template>
  </Component>
</template>
