<script setup lang="ts">
// Types
import type { IMenuProps } from '~/components/Menu/types/menu-props.type'
import type { IDialogProps } from '~/components/Dialog/types/dialog-props.type'

// Constants
import {
  $bp,
  type BREAKPOINTS,
} from '~/libs/App/constants/breakpoints.constant'

// Components
import Dialog from '~/components/Dialog/Dialog.vue'
import Menu from '~/components/Menu/Menu.vue'

type IProps = {
  breakpoint?: keyof typeof BREAKPOINTS
} & IDialogProps &
  IMenuProps

const props = withDefaults(defineProps<IProps>(), {
  breakpoint: 'sm',
  fit: true,
  maxHeight: 99999,
  offset: 8,
  noArrow: true,
  noOverlay: true,
  transitionDuration: 250,
})

const emits = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'hide'): void
  (e: 'show'): void
  (e: 'beforeHide'): void
  (e: 'beforeShow'): void
}>()

// Layout
const menuProxyEl = ref<InstanceType<typeof Menu | typeof Dialog>>()
const model = defineModel({ default: false })

const isMenu = computed(() => $bp[props.breakpoint].value)

defineExpose({
  show: () => menuProxyEl.value?.show(),
  hide: (force?: boolean) => menuProxyEl.value?.hide(force),
  toggle: () => menuProxyEl.value?.toggle(),
  recomputePosition: () => {
    if (menuProxyEl.value && 'recomputePosition' in menuProxyEl.value) {
      menuProxyEl.value?.recomputePosition?.()
    }
  },
  getFloatingEl: () => menuProxyEl.value?.getFloatingEl(),
})

// NOTE: The `v-model:no-overlay` should not really use the `v-model` part
// but the order of props is important and eslint would try to auto-fix this for us
// so this is a workaround to avoid that
</script>

<template>
  <Component
    :is="isMenu ? Menu : Dialog"
    ref="menuProxyEl"
    v-model:no-overlay="isMenu"
    v-bind="$props"
    v-model="model"
    @hide="emits('hide')"
    @show="emits('show')"
    @before-hide="emits('beforeHide')"
    @before-show="emits('beforeShow')"
  >
    <template
      v-if="$slots.title"
      #title
    >
      <slot name="title" />
    </template>

    <template
      v-if="$slots.header"
      #header="{ hide }"
    >
      <slot
        name="header"
        :hide="hide"
      />
    </template>

    <template #default="{ hide }">
      <slot :hide="hide" />
    </template>

    <template #header-right>
      <slot name="header-right" />
    </template>
  </Component>
</template>
