<script setup lang="ts">
// TYPES
import type { IConfirmationProps } from '~/components/Confirmation/types/confirmation-props.type'

const props = withDefaults(defineProps<IConfirmationProps>(), {
  delay: 500,
})

const emits = defineEmits<{
  (e: 'close'): void
  (e: 'update:visible', val: boolean): void
}>()

const model = useVModel(props, 'visible', emits)

function handleClose() {
  model.value = false
  emits('close')
}
</script>

<template>
  <Transition
    enter-active-class="animate-fade-in-up animate-duration-350"
    leave-active-class="animate-fade-out animate-duration-350"
  >
    <div
      v-if="visible"
      class="confirmation"
    >
      <!-- CHECKMARK -->
      <div class="confirmation-checkmark">
        <Checkmark
          :delay="delay"
          w="35"
          h="35"
          :class="checkmarkClass"
        />

        <slot>
          <h6
            text="h6 center"
            p="x-4"
          >
            <span>
              {{ confirmationText }}
            </span>
          </h6>
        </slot>
      </div>

      <!-- ACTIONS -->
      <div
        v-if="!noActions"
        class="actions"
      >
        <slot name="actions" />
        <Btn
          :label="$t('close')"
          @click="handleClose"
        />
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.confirmation {
  --apply: flex flex-col inset-0 absolute bg-ca dark:bg-dark
    rounded-inherit z-10;

  &-checkmark {
    --apply: flex flex-col flex-center grow;
  }
}

.actions {
  --apply: flex items-center p-3 shrink-0 justify-end flex-gap-x-3;
}
</style>
