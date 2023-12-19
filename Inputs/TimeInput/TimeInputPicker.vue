<script setup lang="ts">
import { type MaskedOptions, MaskedRange } from 'imask'

// Types
import type { ITimeInputPickerProps } from '~/components/Inputs/TimeInput/types/time-input-picker-props.type'

// Components
import TextInput from '~/components/Inputs/TextInput/TextInput.vue'
import MenuProxy from '~/components/MenuProxy/MenuProxy.vue'
import VerticalScrollPicker from '~/components/ScrollPicker/VerticalScrollPicker.vue'
import { useAppStore } from '~/libs/App/app.store'

const props = defineProps<ITimeInputPickerProps>()
const emits = defineEmits<{
  (e: 'update:used-touch', val: boolean): void
  (e: 'update:is-am', val: boolean): void
  (e: 'update:update:prevent-next-is-am-change', val: boolean): void
}>()

// Utils
const { lastPointerDownEvent } = storeToRefs(useAppStore())

// Options
const minuteOptions = computed(() =>
  [...Array(60).keys()].map(val => padStart(String(val), 2, '0'))
)
const hourOptions = computed(() =>
  props.is12h
    ? [...Array(12).keys()].map(val => padStart(String(val || 12), 2, '0'))
    : [...Array(24).keys()].map(val => padStart(String(val), 2, '0'))
)

// Masks
const maskHours = computed<MaskedOptions>(() => {
  return {
    mask: 'HH',
    lazy: false,
    blocks: {
      HH: {
        mask: MaskedRange,
        autofix: 'pad',
        placeholderChar: 'H',
        from: props.is12h ? 1 : 0,
        to: props.is12h ? 12 : 23,
        maxLength: 2,
      },
    },
  }
})

const maskMinutes = computed<MaskedOptions>(() => {
  return {
    mask: 'mm',
    lazy: false,
    blocks: {
      mm: {
        mask: MaskedRange,
        autofix: 'pad',
        placeholderChar: 'm',
        from: 0,
        to: 59,
        maxLength: 2,
      },
    },
  }
})

// Layout
const menuProxyEl = ref<InstanceType<typeof MenuProxy>>()
const hInput = ref<InstanceType<typeof TextInput>>()
const mInput = ref<InstanceType<typeof TextInput>>()
const hourEl = ref<InstanceType<typeof VerticalScrollPicker>>()
const minuteEl = ref<InstanceType<typeof VerticalScrollPicker>>()
const isPickerActive = ref(false)
const preventNextChangeFromMobileInputs = autoResetRef(false, 50)
const preventPickerSync = autoResetRef(false, 1000)
const isAm = useVModel(props, 'isAm', emits, { eventName: 'update:is-am' })
const preventNextIsAmChange = useVModel(props, 'preventNextIsAmChange', emits, {
  eventName: 'update:prevent-next-is-am-change',
})

const usedTouch = computed(() => {
  return lastPointerDownEvent.value?.pointerType !== 'mouse'
})

const localizedTimeParts = computed(() => {
  const time = props.modelValueLocalized || '12:00'

  return {
    hh: time.split(':')[0],
    mm: time.split(':')[1],
  }
})

function handlePickerHide() {
  isPickerActive.value = false
}

function setValue(
  val: string | undefined | null,
  type: 'h' | 'm' | 'both',
  syncScrollPickers?: boolean,
  syncWithInputs?: boolean
) {
  if (typeof val !== 'string' || preventNextChangeFromMobileInputs.value) {
    return
  }

  if (type === 'both') {
    preventNextIsAmChange.value = true
    isAm.value = +val.split(':')[0] < 12

    props.handleManualModelChange(val, true)
  } else {
    const [hh, mm] = (props.modelValueLocalized || '12:00').split(':')

    if (type === 'h') {
      props.handleManualModelChange(`${val}:${mm}`, true)
    } else {
      props.handleManualModelChange(`${hh}:${val}`, true)
    }
  }

  // When using header inputs on mobile, we need to manually sync the vertical
  // scroll pickers
  if (syncScrollPickers && !preventPickerSync.value) {
    syncInternalValueWithPicker()
  }

  // On mobiles, when using scroll and have one of the header inputs focused,
  // we need to manually sync the value of the input
  if (syncWithInputs && usedTouch.value) {
    preventPickerSync.value = true
    preventNextChangeFromMobileInputs.value = true
    syncInternalValueWithInputs()
  }
}

function syncInternalValueWithPicker() {
  hourEl.value?.sync()
  minuteEl.value?.sync()
}

function syncInternalValueWithInputs() {
  nextTick(() => {
    hInput.value?.sync()
    mInput.value?.sync()
  })
}

defineExpose({
  show: () => menuProxyEl.value?.show(),
  hide: () => menuProxyEl.value?.hide(),
  sync: () => syncInternalValueWithPicker(),
  getMenuEl: () => menuProxyEl.value,
})
</script>

<template>
  <MenuProxy
    ref="menuProxyEl"
    v-model="isPickerActive"
    manual
    :hide-header="!usedTouch"
    min-w="!60"
    max-w="!80"
    w-80
    position="top"
    placement="bottom-start"
    :reference-target="referenceTarget"
    h="!auto"
    no-uplift
    @hide="handlePickerHide"
  >
    <!-- Header -->
    <template
      v-if="usedTouch"
      #header
    >
      <div
        flex="~ gap-x-2 wrap"
        p="l-3 r-1 y-2"
        items-center
      >
        <TextInput
          ref="hInput"
          label-inside
          :model-value="localizedTimeParts.hh"
          input-class="text-center w-full"
          class="w-[calc(50%-8px)]"
          :mask="maskHours"
          :label="$t('general.hour', 1)"
          inputmode="decimal"
          @update:model-value="setValue($event, 'h', true)"
        />
        <TextInput
          ref="mInput"
          label-inside
          :model-value="localizedTimeParts.mm"
          input-class="text-center w-full"
          class="w-[calc(50%-8px)]"
          :mask="maskMinutes"
          :label="$t('general.minute', 1)"
          inputmode="decimal"
          @update:model-value="setValue($event, 'm', true)"
        />
      </div>
    </template>

    <!-- Scrollers -->
    <div
      flex="~ gap-x-2 center"
      @mousedown.stop.prevent
    >
      <VerticalScrollPicker
        ref="hourEl"
        :model-value="localizedTimeParts.hh"
        flex="1"
        :options="hourOptions"
        @update:model-value="setValue($event, 'h', undefined, true)"
      />
      <VerticalScrollPicker
        ref="minuteEl"
        :model-value="localizedTimeParts.mm"
        flex="1"
        :options="minuteOptions"
        @update:model-value="setValue($event, 'm', undefined, true)"
      />

      <!-- AM/PM -->
      <div
        v-if="is12h"
        flex="~ col"
        w="12"
        p="t-8"
      >
        <Btn
          size="sm"
          :ripple="false"
          @click="isAm = true"
        >
          <template #label>
            <div
              transition="transform duration-200"
              :class="[
                !isAm ? 'font-thin' : 'font-bold',
                { 'scale-65': !isAm },
              ]"
            >
              {{ $t('general.am') }}
            </div>
          </template>
        </Btn>

        <Btn
          size="sm"
          :ripple="false"
          @click="isAm = false"
        >
          <template #label>
            <div
              transition="transform duration-200"
              :class="[isAm ? 'font-thin scale-65' : 'font-bold']"
            >
              {{ $t('general.pm') }}
            </div>
          </template>
        </Btn>
      </div>
    </div>

    <!-- Shortcuts -->
    <Field
      v-if="shortcuts"
      :label="$t('general.shortcuts')"
      dense
      p="t-4"
    >
      <HorizontalScroller
        class="shortcuts"
        content-class="gap-x-1 p-x-2"
        arrows="outside"
      >
        <Chip
          v-for="(shortcut, idx) in shortcuts"
          :key="idx"
          :label="shortcut.label"
          ripple
          center
          class="shortcuts-chip"
          :class="{ 'is-12h': is12h }"
          @click="setValue(shortcut.value, 'both', true, true)"
        />
      </HorizontalScroller>
    </Field>
  </MenuProxy>
</template>

<style lang="scss" scoped>
.shortcuts {
  --apply: h-9;

  &-chip {
    --apply: color-ca text-center cursor-pointer min-w-14;

    &.is-12h {
      --apply: min-w-22;
    }
  }
}

.menu[placement^='top'] {
  .shortcuts {
    --apply: order--1 p-b-1;
  }
}
</style>
