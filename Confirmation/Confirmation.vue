<script setup lang="ts">
// Types
import type { IConfirmationProps } from '~/components/Confirmation/types/confirmation-props.type'

withDefaults(defineProps<IConfirmationProps>(), {
  delay: 500,
})

const emits = defineEmits<{
  (e: 'close'): void
  (e: 'update:visible', val: boolean): void
}>()

const model = defineModel<boolean>('visible')

const transitionProps = computed(() => ({
  enterActiveClass: 'animate-fade-in-up animate-duration-350',
  leaveActiveClass: 'animate-fade-out animate-duration-350',
}))

function handleClose() {
  model.value = false
  emits('close')
}
</script>

<template>
  <Transition v-bind="transitionProps">
    <div
      v-if="visible"
      class="confirmation"
    >
      <!-- Checkmark -->
      <div class="confirmation-checkmark">
        <slot name="checkmark">
          <Checkmark
            :delay="delay"
            w="35"
            h="35"
            :class="checkmarkClass"
          />
        </slot>

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

      <!-- Actions -->
      <div
        v-if="!noActions"
        class="actions"
      >
        <slot name="actions" />
        <Btn
          :label="$t('general.close')"
          no-uppercase
          icon="i-solar:close-square-broken"
          color="negative"
          @click="handleClose"
        />
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.confirmation {
  @apply flex flex-col inset-0 absolute bg-white dark:bg-darker rounded-custom z-$zMax;

  &-checkmark {
    @apply flex flex-col flex-center grow;
  }
}

.actions {
  @apply flex items-center p-x-3 p-y-1 shrink-0 justify-end flex-gap-x-3;
}
</style>
