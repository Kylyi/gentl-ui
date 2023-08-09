<script setup lang="ts">
// TODO: I'm using `props.optionLabel` for adding new items on the fly
// but it will not work when optionLabel is a function

// TYPES
import type { ISelectorProps } from '~~/components/Selector/types/selector-props.type'

// COMPOSITION FUNCTIONS
import { useSelectorUtils } from '~~/components/Selector/functions/useSelectorUtils'

// COMPONENTS
import List from '@/components/List/List.vue'
import MenuProxy from '@/components/MenuProxy/MenuProxy.vue'
import InputWrapper from '@/components/Inputs/InputWrapper.vue'
import ScrollArea from '@/components/ScrollArea/ScrollArea.vue'
import { IItemToBeAdded } from '~/components/List/types/list-item-to-add.type'

const props = withDefaults(defineProps<ISelectorProps>(), {
  debounce: 500,
  emptyValue: () => undefined,
  errorTakesSpace: true,
  errorVisible: true,
  maxChipsRows: 2,
  optionKey: 'id',
  optionLabel: 'label',
  options: () => [],
  size: 'md',
})

const emits = defineEmits<{
  (e: 'update:modelValue', val: any): void
  (e: 'update:options', val: any[]): void
  (e: 'added', item: any): void
  (e: 'removed', item: any): void
  (e: 'validation-reset', val?: string | undefined | null): void
  (e: 'picker-hide'): void
  (e: 'picker-before-hide'): void
  (e: 'picker-show'): void
  (e: 'picker-before-show'): void
  (e: 'blur'): void
}>()

// LIFECYCLE
onMounted(() => {
  menuReferenceTarget.value =
    currentInstance?.proxy?.$el.querySelector('.wrapper-body')
})

// UTILS
const currentInstance = getCurrentInstance()

const hasContent = computed(() => {
  return Array.isArray(model.value)
    ? model.value.length > 0
    : !isNil(model.value) && model.value !== ''
})

// SELECTION
const maxHeight = computedEager(() => {
  return props.maxChipsRows * 26
})

function getKey(option: any): string {
  return typeof option === 'object' ? get(option, props.optionKey) : option
}

function getLabel(option: any) {
  if (isNil(option)) {
    return ''
  }

  if (typeof props.optionLabel === 'function') {
    return typeof option !== 'object'
      ? props.optionLabel(optionsByKey.value[option])
      : props.optionLabel(option)
  }

  return typeof option !== 'object'
    ? get(optionsByKey.value[option], props.optionLabel) ?? option
    : get(option, props.optionLabel)
}

function getOption(option: any): any {
  if (Array.isArray(option)) {
    return option.map(opt => getOption(opt))
  }

  return typeof option !== 'object' ? get(optionsByKey.value, option) : option
}

function handleSelectedMultiple(options: any[]) {
  // FIXME: WORKS ONLY FOR `emitKey === true`
  if (Array.isArray(model.value) || !model.value) {
    const newVal = uniq([...(model.value || []), ...options])

    if (newVal.length) {
      model.value = newVal
    } else {
      model.value = props.emptyValue
    }
  } else {
    options.forEach(opt => {
      model.value[getKey(opt)] = opt
    })
  }
}

function handleRemove(item: any) {
  const optionKey = getKey(item)

  if (props.multi) {
    if (Array.isArray(model.value)) {
      model.value = model.value.filter((sel: any) => getKey(sel) !== optionKey)
    } else {
      model.value = omit(model.value, optionKey)
    }

    if (!model.value.length) {
      model.value = props.emptyValue
    }

    emits('removed', item)
  } else if (props.clearable) {
    model.value = props.emptyValue
  }

  // Remove the item from the added items if it was about to be created
  if (typeof item === 'object' && '_isCreate' in item && item._isCreate) {
    addedItems.value = props.multi
      ? addedItems.value.filter(_item => getKey(_item) !== getKey(item))
      : []

    nextTick(() => {
      listEl.value?.clearSearch()
      listEl.value?.refresh()
    })
  }

  syncScrollArea()
}

// Item adding
const addedItems = ref<IItemToBeAdded[]>([])

// Selection
function handleSelect(val: any) {
  if (props.multi && !val.length) {
    model.value = props.emptyValue
  } else if (props.multi) {
    model.value = [...val]
  } else {
    model.value = val
  }

  if (!props.multi) {
    menuProxyEl.value?.hide()
  }
}

function handleSelectAdd(data: any) {
  emits('added', data)
  syncScrollArea()
}

function handleSelectRemove(data: any) {
  emits('removed', data)
  syncScrollArea()
}

// LIST
const isOptionsInternalLoaded = ref(false)
const listEl = ref<InstanceType<typeof List>>()
const options = toRef(props, 'options')
const optionsInternal = ref<any[]>([])
const listProps = reactivePick(props, [
  'allowAdd',
  'disabledFnc',
  'emitKey',
  'fuseOptions',
  'multi',
  'itemHeight',
  'sortBy',
  'groupBy',
  'clearable',
  'noSort',
  'loading',
  'noSearch',
  'noHighlight',
  'noLocalAdd',
  'loadData',
  'allowSelectAllFiltered',
])

const optionsExtended = computed(() => {
  const optionsAdjusted = [...options.value, ...optionsInternal.value].map(
    opt =>
      typeof opt === 'object'
        ? opt
        : { [props.optionKey]: opt, [props.optionLabel as string]: opt }
  )

  return optionsAdjusted
})

/**
 * The options we actually want to show in the list ~ the extended options
 * minus the hidden ones
 */
const listOptions = computed({
  get() {
    let hiddenOptions = props.hiddenOptions

    if (hiddenOptions) {
      if (!props.hideSelf) {
        const selectedOptionsKeys = Array.isArray(model.value)
          ? model.value.map((opt: any) => getKey(opt))
          : [getKey(model.value)]

        hiddenOptions = omit(hiddenOptions, selectedOptionsKeys)
      }

      return optionsExtended.value.filter(opt => !hiddenOptions![getKey(opt)])
    }

    return optionsExtended.value
  },
  set(val: any[]) {
    optionsInternal.value = val
  },
})

const optionsByKey = computed(() => {
  return [
    ...optionsExtended.value,
    ...(props.initialMap
      ? Array.isArray(props.initialMap)
        ? props.initialMap
        : [props.initialMap]
      : []),
  ].reduce((agg, option) => {
    const key = get(option, props.optionKey)
    agg[key] = option

    return agg
  }, {})
})

// We recalculate the menu position on `listOptions` change
watch(listOptions, () => {
  menuProxyEl.value?.recomputePosition()
})

// PICKER
const menuProxyEl = ref<InstanceType<typeof MenuProxy>>()
const menuPlacement = ref('bottom')
const isPickerActive = ref(false)
const pickerAnimationState = ref<'show' | 'hide'>('hide')

function handleBeforeHide() {
  pickerAnimationState.value = 'hide'
  emits('picker-before-hide')

  if (props.loadData?.onSearch) {
    listEl.value?.clearSearch()
  }
}

function handleBeforeShow() {
  pickerAnimationState.value = 'show'
  emits('picker-before-show')
}

function handleHide() {
  isPickerActive.value = false
  pickerAnimationState.value = 'hide'
  emits('picker-hide')
}

function handleShow() {
  pickerAnimationState.value = 'show'
  emits('picker-show')
}

// LAYOUT
const { model, wrapperProps, handleClickWrapper, handleFocusOrClick, clear } =
  useSelectorUtils({
    props,
    menuElRef: menuProxyEl,
  })

const menuReferenceTarget = ref<HTMLElement>()
const optionsContainerEl = ref<any>()
const isLoadingInternal = ref(false)

const isLoading = computed(() => {
  return (
    (props.loading || isLoadingInternal.value) &&
    pickerAnimationState.value !== 'hide'
  )
})

function syncScrollArea() {
  setTimeout(() => {
    optionsContainerEl.value?.update?.()
    optionsContainerEl.value?.scrollToBottom?.()
  }, 0)
}

// PRESELECT ON INIT
if (
  props.preselectFirst &&
  (props.modelValue === props.emptyValue || isNil(props.modelValue)) &&
  props.options.length > 0
) {
  if (props.emitKey) {
    handleSelect(getKey(options.value[0]))
  } else {
    handleSelect([options.value[0]])
  }
}

defineExpose({
  focus: () => menuProxyEl.value?.show(),
  blur: () => menuProxyEl.value?.hide(),
  loadData: () => listEl.value?.loadData(),
  resetInternalOptions: () => {
    optionsInternal.value = []
    isOptionsInternalLoaded.value = false
  },
  handleSelect,
})
</script>

<template>
  <InputWrapper
    v-bind="wrapperProps"
    :loading="isLoading"
    :has-content="hasContent"
    :content-class="contentClass"
    :class="[
      menuPlacement === 'bottom' ? 'has-menu-bottom' : 'has-menu-top',
      {
        'is-active': pickerAnimationState === 'show',
        'is-menu-width-matched': !noMenuMatchWidth,
      },
    ]"
    @click="handleClickWrapper"
  >
    <template
      v-if="$slots.prepend"
      #prepend
    >
      <slot name="prepend" />
    </template>

    <span
      v-if="$slots.selection"
      class="control"
    >
      <slot
        name="selection"
        :selected-option="getOption(model)"
      />
    </span>

    <Component
      :is="scroller ? 'div' : ScrollArea"
      v-else
      ref="optionsContainerEl"
      flex="~ 1 wrap gap-1"
      class="control"
      box="content"
      tabindex="0"
      :class="[innerClass, { 'is-multi': !!multi }]"
      :style="{ maxHeight: `${maxHeight}px` }"
      @focus="handleFocusOrClick"
    >
      <span
        v-if="placeholder && !hasContent"
        class="placeholder"
      >
        {{ placeholder }}
      </span>

      <HorizontalScroller
        v-if="multi && scroller"
        content-class="flex-gap-x-2"
        arrows="outside"
      >
        <Chip
          v-for="(chip, idx) in modelValue"
          :key="idx"
          :label="getLabel(chip)"
          min-w="20"
          p="!y-1px"
          :has-remove="!(readonly || disabled)"
          @remove="handleRemove(chip)"
        />
      </HorizontalScroller>

      <template v-else-if="multi && model">
        <Chip
          v-for="(chip, idx) in modelValue"
          :key="idx"
          :label="getLabel(chip)"
          :has-remove="!(readonly || disabled) && !noItemsClear"
          min-w="20"
          p="!y-1px"
          @remove="handleRemove(chip)"
        />
      </template>

      <span
        v-else-if="model"
        self-center
        style="width: calc(100% - 12px)"
        :class="{ truncate: !noTruncate }"
      >
        {{ getLabel(model) }}
      </span>
    </Component>

    <template #append>
      <div
        v-if="$slots.append || (!readonly && !disabled && !noDropdownIcon)"
        flex="~ gap-x-1 center"
        p="x-2"
        shrink-0
        fit
        :class="appendClass"
        @click="handleFocusOrClick"
      >
        <Btn
          v-if="clearable && modelValue && !multi && !disabled && !readonly"
          icon="eva:close-fill h-6 w-6"
          color="ca"
          size="auto"
          h="7"
          w="7"
          tabindex="-1"
          @click.stop.prevent="!clearConfirmation && clear()"
        >
          <MenuConfirmation
            v-if="clearConfirmation"
            @ok="clear"
          >
            {{ clearConfirmation }}
          </MenuConfirmation>
        </Btn>

        <div
          v-if="!disabled && !readonly && !noDropdownIcon"
          fluent:chevron-up-down-24-regular
          class="dropdown-icon"
        />

        <slot
          name="append"
          :clear="clear"
        />
      </div>
    </template>

    <template #menu>
      <MenuProxy
        ref="menuProxyEl"
        v-model="isPickerActive"
        manual
        hide-header
        position="top"
        dense
        class="selector"
        :class="{
          'has-label': !!label,
          'md:m-l-200px': inline,
          'is-menu-width-matched': !noMenuMatchWidth,
        }"
        :offset="noMenuMatchWidth ? 8 : 0"
        :no-arrow="noMenuMatchWidth ? false : true"
        :match-width="!noMenuMatchWidth"
        :reference-target="menuReferenceTarget"
        :expected-height="expectedHeight"
        :fit="false"
        no-uplift
        max-height="50%"
        @placement="menuPlacement = $event"
        @before-hide="handleBeforeHide"
        @hide="handleHide"
        @before-show="handleBeforeShow"
        @show="handleShow"
      >
        <slot name="picker">
          <List
            ref="listEl"
            v-model:added-items="addedItems"
            v-model:items="listOptions"
            :selected="modelValue || []"
            :item-key="optionKey"
            :item-label="optionLabel"
            v-bind="listProps"
            @update:selected="handleSelect"
            @added="handleSelectAdd"
            @selected-multiple="handleSelectedMultiple"
            @removed="handleSelectRemove"
          >
            <template
              v-if="$bp.isSmaller('sm')"
              #after-search
            >
              <Btn
                preset="CLOSE"
                self-center
                m="r-2"
                @click="isPickerActive = false"
              />
            </template>

            <template #below>
              <slot name="below-options" />

              <template v-if="multi">
                <!-- CONFIRM BUTTON (for lt-sm displays) -->
                <Separator display="sm:none" />

                <Btn
                  display="!sm:none"
                  :label="$t('general.confirm')"
                  :rounded="false"
                  bg="primary"
                  color="white"
                  @click="isPickerActive = false"
                />
              </template>
            </template>

            <template #option="{ item }">
              <slot
                name="item"
                :item="item"
              />
            </template>
          </List>
        </slot>
      </MenuProxy>
    </template>
  </InputWrapper>
</template>

<style lang="scss" scoped>
.placeholder {
  color: #9ca3af;
}

.dropdown-icon {
  --apply: shrink-0 color-ca slef-center inline cursor-pointer;
}

.wrapper--sm {
  .dropdown-icon {
    --apply: h-3.5 w-3.5;
  }
}

.wrapper--md {
  .dropdown-icon {
    --apply: h-4 w-4;
  }
}

.is-active {
  :deep(.label) {
    --apply: dark:color-primary color-primary;
  }

  :deep(.wrapper-body:after) {
    --apply: border-primary dark:border-primary;
  }
}

.is-active.is-menu-width-matched.has-menu-bottom {
  :deep(.wrapper-body:after) {
    --apply: rounded-b-0;
  }
}

.is-active.is-menu-width-matched.has-menu-top {
  :deep(.wrapper-body:after) {
    --apply: rounded-t-0;
  }
}

.control {
  --apply: flex;

  &::after {
    --apply: color-transparent w-0;
    content: '_';
  }
}
</style>
