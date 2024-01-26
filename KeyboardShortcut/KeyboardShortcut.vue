<script setup lang="ts">
type IProps = {
  icon?: string
  char?: string
  withCtrl?: boolean
  withAlt?: boolean
  withShift?: boolean
}

const props = defineProps<IProps>()

const { isApple } = useDevice()

const hasAnyModifier = computed(() => {
  return props.withCtrl || props.withAlt || props.withShift
})
</script>

<template>
  <div class="keyboard-shortcut">
    <!-- Modifier - CTRL -->
    <div
      v-if="withCtrl"
      class="keyboard-shortcut__wrapper"
    >
      <div
        v-if="isApple"
        ph:command
        class="icon"
      />
      <div
        v-else
        fluent:control-button-20-regular
        class="icon"
      />
    </div>

    <!-- Modifier - ALT -->
    <div
      v-if="withAlt"
      class="keyboard-shortcut__wrapper"
    >
      <div
        v-if="isApple"
        ph:option
        class="icon"
      />
      <div
        v-else
        tabler:alt
        class="icon"
      />
    </div>

    <!-- Modifier - SHIFT -->
    <div
      v-if="withShift"
      class="keyboard-shortcut__wrapper"
    >
      <div
        material-symbols:shift-lock-rounded
        class="icon"
      />
    </div>

    <div v-if="hasAnyModifier">+</div>

    <!-- Key -->
    <div class="keyboard-shortcut__wrapper">
      <div
        :class="icon"
        font="rem-14"
      >
        {{ char }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.keyboard-shortcut {
  --apply: flex gap-1 items-center font-mono color-ca leading-none;

  &__wrapper {
    --apply: flex flex-center border-1 border-ca rounded-custom w-4.5 h-4.5;

    & > .icon {
      --apply: w-full h-full;
    }
  }
}
</style>
