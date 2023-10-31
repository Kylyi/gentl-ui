<script setup lang="ts">
type IProps = {
  archived?: boolean
  disabled?: boolean
  isEditing?: boolean
}

const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'update:isEditing', val: boolean): void
  (e: 'restore'): void
}>()

// Injections
const isInEditMode = inject('isInEditMode', ref<any>())

const isEditing = useVModel(props, 'isEditing', emits)

const transitionProps = computed(() => ({
  enterActiveClass: 'animate-zoom-in animate-duration-250',
  leaveActiveClass: 'animate-fade-out-up animate-duration-350',
}))

function handleClick() {
  if (props.archived) {
    emits('restore')

    return
  }

  isEditing.value = true
  isInEditMode.value = true
}

watchEffect(() => {
  isEditing.value = props.isEditing
  isInEditMode.value = props.isEditing
})
</script>

<template>
  <Transition v-bind="transitionProps">
    <div
      v-if="!isEditing"
      class="crud-edit-btn-wrapper"
    >
      <Btn
        :preset="archived ? 'RESTORE' : 'EDIT'"
        :label="archived ? $t('restore') : $t('edit')"
        no-dim
        :disabled="disabled"
        class="crud-edit-btn"
        :class="{ 'is-archived': archived }"
        data-cy="crud-edit-button"
        @click="handleClick"
      />
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.crud-edit-btn {
  --apply: md:min-w-60 w-full m-x-1;

  &:not(.is-archived):not(.is-disabled) {
    --apply: bg-primary color-white;
  }

  &.is-archived {
    --apply: bg-dark-50 color-true-gray-400;
  }

  &-wrapper {
    --apply : absolute inset-block-0 right-0 flex flex-center rounded-inherit
    bg-white dark:bg-darker min-w-full;
  }
}
</style>
