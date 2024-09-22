<script setup lang="ts">
// Types
import type { IMainBarProps } from '~/components/MainBar/types/main-bar-props.type'

// Components
import CrudBtns from '~/components/Crud/CrudBtns.vue'

defineProps<IMainBarProps>()
defineEmits<{
  (e: 'save'): void
  (e: 'delete'): void
}>()

defineSlots<{
  'subtitle'?: (payload: {}) => void
  'title-append'?: (payload: {}) => void
  'right'?: (payload: {}) => void
  'left'?: (payload: {}) => void
  'inner'?: (payload: {}) => void
  'right-bottom'?: (payload: {}) => void
  'actions-prepend'?: (payload: {
    loaderType: 'inline' | 'block'
    labels: boolean
  }) => void
  'actions-append'?: (payload: {
    loaderType: 'inline' | 'block'
    labels: boolean
  }) => void
  'breadcrumbs-right'?: (payload: {}) => void
}>()

const crudBtnsEl = ref<InstanceType<typeof CrudBtns>>()
const headerEl = ref<HTMLDivElement>()

defineExpose({
  save: () => crudBtnsEl.value?.save(),
  delete: () => crudBtnsEl.value?.delete(),
})
</script>

<template>
  <header
    ref="headerEl"
    class="main-bar"
  >
    <Breadcrumbs v-if="!noBreadcrumbs">
      <template #right>
        <slot name="breadcrumbs-right" />
      </template>
    </Breadcrumbs>

    <div class="main-bar-content">
      <slot name="left" />

      <!-- Title & Subtitle -->
      <div class="main-bar-title">
        <!-- Title -->
        <Heading
          filled
          :class="[headingClass, { '!min-h-9': !!subtitle || $slots.subtitle }]"
        >
          {{ title }}

          <slot name="title-append" />
        </Heading>

        <!-- Subtitle -->
        <slot name="subtitle">
          <span
            v-if="subtitle"
            class="main-bar-subtitle"
          >
            {{ subtitle }}
          </span>
        </slot>
      </div>

      <slot name="right">
        <div
          v-if="!!actions"
          class="main-bar-actions"
        >
          <CrudBtns
            ref="crudBtnsEl"
            labels
            :loading="loading"
            :actions="actions"
            @save="$emit('save')"
            @delete="$emit('delete')"
          >
            <template #prepend="{ loaderType, labels }">
              <slot
                name="actions-prepend"
                :loader-type="loaderType"
                :labels="!!labels"
              />
            </template>

            <template #append="{ loaderType, labels }">
              <slot
                name="actions-append"
                :loader-type="loaderType"
                :labels="!!labels"
              />
            </template>
          </CrudBtns>

          <slot name="right-bottom" />
        </div>
      </slot>
    </div>

    <slot name="inner" />
  </header>
</template>

<style lang="scss">
.main-bar {
  @applyflex relative flex-col gap-x-2 p-t-2 z-$zMainBar w-full shrink-0
  bg-white dark:bg-darker p-b-2;

  transition: padding 250ms cubic-bezier(0, 0, 0.2, 1);

  &-content {
    @applyflex flex-gap-x-4 grow items-center rounded-custom;
    @applybg-$MainBar-bg;
  }

  &-title {
    @applyflex flex-col grow overflow-auto relative rounded-custom;
  }

  &-subtitle {
    @applytext-caption p-x-4 p-b-2 m-t--1;
  }

  &-actions {
    @applyflex flex-col self-start m-t-1 m-x-2;
  }
}

aside.drawer--left.is-open + header .main-bar {
  @applylg:p-l-$drawerLeftWidth;
}

aside.drawer--right.is-open + header .main-bar {
  @applylg:p-r-$drawerLeftWidth;
}
</style>
