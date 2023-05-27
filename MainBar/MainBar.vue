<script setup lang="ts">
// TYPES
import type { IMainBarProps } from '~~/components/MainBar/types/main-bar-props.type'

// COMPONENTS
import CrudBtns from '@/components/Crud/CrudBtns.vue'

defineProps<IMainBarProps>()
defineEmits<{
  (e: 'save'): void
  (e: 'delete'): void
}>()

defineSlots<{
  'subtitle'?: (payload: {}) => void
  'right'?: (payload: {}) => void
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
    <Breadcrumbs v-if="!noBreadcrumbs" />

    <div class="main-bar-content">
      <!-- TITLE & SUBTITLE -->
      <div class="main-bar-title">
        <!-- TITLE -->
        <Heading filled>
          {{ title }}
        </Heading>

        <!-- SUBTITLE -->
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
  </header>
</template>

<style lang="scss">
.main-bar {
  --apply: flex relative flex-col gap-x-2 p-t-2 z-$zMainBar w-full shrink-0
  bg-white dark:bg-darker p-b-2;

  transition: padding 250ms cubic-bezier(0, 0, 0.2, 1);

  &-content {
    --apply: flex flex-gap-x-4 grow items-center m-t-1 rounded-custom
      dark:bg-darker bg-white color-black dark:color-white;
  }

  &-title {
    --apply: flex flex-col grow overflow-auto relative bg-ca rounded-custom;
  }

  &-subtitle {
    --apply: text-caption p-x-4 p-b-2 m-t--1;
  }

  &-actions {
    --apply: flex flex-col self-start;
  }
}

aside.drawer--left.is-open + header .main-bar {
  --apply: lg:p-l-$drawerLeftWidth;
}

aside.drawer--right.is-open + header .main-bar {
  --apply: lg:p-r-$drawerLeftWidth;
}
</style>
