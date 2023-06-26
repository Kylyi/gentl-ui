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

const isEditing = useVModel(props, 'isEditing', emits)

function handleClick() {
  if (props.archived) {
    emits('restore')

    return
  }

  isEditing.value = true
}

watchEffect(() => {
  isEditing.value = props.isEditing
})
</script>

<template>
  <Transition
    enter-active-class="animate-zoom-in animate-duration-250"
    leave-active-class="animate-fade-out-up animate-duration-350"
  >
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
        @click="handleClick"
      />
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.crud-edit-btn {
  --apply: w-full m-x-1;

  &:not(.is-archived):not(.is-disabled) {
    --apply: bg-primary color-white;
  }

  &.is-archived {
    --apply: dark-50 color-true-gray-400;
  }

  &-wrapper {
    --apply : absolute inset-0 flex flex-center rounded-inherit bg-white dark:bg-darker;
  }
}
</style>
