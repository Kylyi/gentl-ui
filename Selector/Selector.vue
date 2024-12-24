<script setup lang="ts">
import { NuxtLink } from '#components'

// ENHANCMENT: I'm using `props.optionLabel` for adding new items on the fly
// but it will not work when optionLabel is a function
import { config } from '~/components/config/components-config'

// Types
import type { ISelectorProps } from '~/components/Selector/types/selector-props.type'
import type { IItemToBeAdded } from '~/components/List/types/list-item-to-add.type'

// Functions
import { useListUtils } from '~/components/List/functions/useListUtils'
import { getComponentProps } from '~/components/__helpers/get-config-props'
import { useSelectorUtils } from '~/components/Selector/functions/useSelectorUtils'
import { useInputValidationUtils } from '~/components/Inputs/functions/useInputValidationUtils'

// Components
import List from '~/components/List/List.vue'
import MenuProxy from '~/components/MenuProxy/MenuProxy.vue'
import InputWrapper from '~/components/Inputs/InputWrapper.vue'
import ScrollArea from '~/components/ScrollArea/ScrollArea.vue'

const props = withDefaults(defineProps<ISelectorProps>(), {
  ...getComponentProps('selector'),

  maxChipsRows: props => {
    switch (props.layout) {
      case 'inline':
        return 10

      case 'label-inside':
      case 'regular':
      default:
        return 2
    }
  },
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

defineExpose({
  focus: () => handleFocusOrClick(),
  blur: () => menuProxyEl.value?.hide(),
  loadData: () => listEl.value?.loadData(),
  resetInternalOptions: () => {
    optionsInternal.value = []
  },
  handleSelect,
  handleRemove,
  clear: () => clear(),
})

const slots = useSlots()

// Lifecycle
onMounted(() => {
  menuReferenceTarget.value = self?.proxy?.$el.querySelector(
    '.input-wrapper-border',
  )
})

// When layout changes, we need to set new reference target for menu
watch(
  () => props.layout,
  () => {
    nextTick(() => {
      menuReferenceTarget.value = self?.proxy?.$el.querySelector(
        '.input-wrapper-border',
      )
    })
  },
)

// Utils
const self = getCurrentInstance()
const { $bp } = useNuxtApp()
const { handleRequest } = useRequest()
const { path } = useInputValidationUtils(props)
const { getListProps } = useListUtils()

const hasContent = computed(() => {
  return Array.isArray(model.value)
    ? model.value.length > 0
    : !isNil(getKey(model.value)) && model.value !== ''
})

// Selection
const maxHeight = computed(() => {
  const MARGIN_BOTTOM = 2

  return props.maxChipsRows * 26 - MARGIN_BOTTOM
})

function getKey(option: any): string {
  return typeof option === 'object' ? get(option, props.optionKey) : option
}

function getChipClass(item: any) {
  return typeof props.chipClass === 'function'
    ? props.chipClass(item)
    : props.chipClass
}

function getChipStyle(item: any) {
  return typeof props.chipStyle === 'function'
    ? props.chipStyle(item)
    : props.chipStyle
}

function getLabel(option: any) {
  if (isNil(option)) {
    return ''
  }

  // We provided the `selectionLabel` prop
  if (typeof props.selectionLabel === 'function') {
    return typeof option !== 'object'
      ? props.selectionLabel(optionsByKey.value[option]) || option
      : props.selectionLabel(option)
  }

  // We provided the `optionLabel` prop
  if (typeof props.optionLabel === 'function') {
    return typeof option !== 'object'
      ? props.optionLabel(optionsByKey.value[option]) || option
      : props.optionLabel(option)
  }

  return typeof option !== 'object'
    ? get(optionsByKey.value[option], props.optionLabel) ?? option
    : get(option, props.optionLabel) ?? get(optionsByKey.value[getKey(option)], props.optionLabel)
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

  // TODO: Remove once I'm sure it's not really needed...
  // Remove the item from the added items if it was about to be created
  // if (typeof item === 'object' && '_isCreate' in item && item._isCreate) {
  //   addedItems.value = props.multi
  //     ? addedItems.value.filter(_item => getKey(_item) !== getKey(item))
  //     : []

  //   nextTick(() => {
  //     listEl.value?.clearSearch()
  //     listEl.value?.refresh()
  //   })
  // }

  syncScrollArea()
}

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

// Item adding & removing
const addedItems = ref<IItemToBeAdded[]>([])

function handleSelectAdd(data: any) {
  emits('added', data)
  syncScrollArea()
  menuProxyEl.value?.recomputePosition()
}

function handleSelectRemove(data: any) {
  emits('removed', data)
  syncScrollArea()
  menuProxyEl.value?.recomputePosition()
}

// List
const listEl = ref<InstanceType<typeof List>>()
const options = toRef(props, 'options')
const optionsInternal = ref<any[]>([])
const listProps = getListProps(props)

const optionsExtended = computed(() => {
  const optionsAdjusted = [...options.value, ...optionsInternal.value].map(
    opt =>
      typeof opt === 'object'
        ? opt
        : { [props.optionKey]: opt, [props.optionLabel as string]: opt },
  )

  return optionsAdjusted
})

/**
 * The options we actually want to show in the list ~
 * the extended options minus the hidden ones
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

// Picker
const menuProxyEl = ref<ComponentInstance<typeof MenuProxy>>()
const menuPlacement = ref('bottom')

function handleBeforeHide() {
  preventNextFocus.value = true
  const optionsContainerDom = unrefElement(el)
  optionsContainerDom?.focus()

  pickerAnimationState.value = 'hide'
  emits('picker-before-hide')
}

function handleBeforeShow() {
  pickerAnimationState.value = 'show'
  emits('picker-before-show')
}

function handleHide() {
  isPickerActive.value = false
  pickerAnimationState.value = 'hide'
  // optionsInternal.value = []

  if (props.loadData?.onSearch) {
    listEl.value?.clearSearch()
  }

  emits('picker-hide')
}

function handleShow() {
  pickerAnimationState.value = 'show'
  emits('picker-show')
}

// Layout
const {
  el,
  inputId,
  preventNextFocus,
  isPickerActive,
  pickerAnimationState,
  model,
  search,
  wrapperProps,
  handleClickWrapper,
  handleFocusOrClick,
  clear,
} = useSelectorUtils({
  props,
  menuElRef: menuProxyEl,
})

const menuReferenceTarget = ref<HTMLElement>()
const isLoadingInternal = ref(false)

const isLoading = computed(() => {
  return props.loading || isLoadingInternal.value
})

const hasAppendSlot = computed(() => {
  if (props.noAppend) {
    return false
  }

  return slots.append || (!props.readonly && !props.disabled)
})

const ui = computed(() => {
  return {
    ...props.ui,
    contentClass: [props.ui?.contentClass, 'selector-wrapper'],
  } as typeof props.ui
})

const componentSingle = computed(() => {
  const preventClick = (ev: MouseEvent) => {
    ev.preventDefault()
    ev.stopPropagation()
  }

  return {
    component: props.to ? NuxtLink : 'span',
    to: typeof props.to === 'function' ? props.to(model.value) : props.to,
    class: props.to ? 'link' : '',
    onClick: props.to ? preventClick : undefined,
  }
})

function syncScrollArea() {
  setTimeout(() => {
    el.value?.update?.()
    el.value?.scrollToBottom?.()
  }, 0)
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown' && !props.readonly && !props.disabled) {
    e.preventDefault()

    menuProxyEl.value?.show()
  }
}

// Fetch data immediately
if (props.loadData?.immediate) {
  getData()
}

// Preselect on init
if (
  props.preselectFirst
  && (props.modelValue === props.emptyValue || isNil(props.modelValue))
  && props.options.length > 0
) {
  if (props.emitKey) {
    handleSelect(getKey(options.value[0]))
  } else {
    handleSelect([options.value[0]])
  }
}

// Data fetching
function getData() {
  handleRequest(async () => {
    if (props.loadData) {
      const mapKey = props.loadData.mapKey ?? config.selector.mapKey

      const res = await props.loadData.fnc({ search: undefined })

      if (props.loadData.local) {
        optionsInternal.value = res
      } else {
        optionsInternal.value = get(res, mapKey)
      }
    }
  })
}
</script>

<template>
  <InputWrapper
    v-bind="wrapperProps"
    :id="inputId"
    :loading="isLoading"
    :has-content
    :ui
    prefer-margin
    :class="[
      menuPlacement === 'bottom' ? 'has-menu-bottom' : 'has-menu-top',
      {
        'is-active': pickerAnimationState === 'show',
        'has-content': hasContent,
        'is-menu-width-matched': !noMenuMatchWidth,
      },
    ]"
    .focus="handleFocusOrClick"
    data-onboarding="selector"
    @click="handleClickWrapper"
    @label-click="handleFocusOrClick"
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
      :class="[controlClass, { 'has-content': hasContent || placeholder }]"
      :readonly="readonly"
      :disabled="disabled"
      @click="handleFocusOrClick"
    >
      <slot
        name="selection"
        :selected-option="getOption(model)"
      />
    </span>

    <Component
      :is="scroller ? 'div' : ScrollArea"
      v-else
      :id="inputId"
      ref="el"
      flex="~ 1 wrap gap-x-1 gap-y-0.5"
      class="control"
      box="content"
      tabindex="0"
      :name="name || path || label || placeholder"
      :class="[innerClass, { 'is-multi': !!multi, 'has-content': hasContent || placeholder }]"
      :style="{ maxHeight: `${maxHeight}px` }"
      :readonly="readonly"
      :disabled="disabled"
      v-bind="inputProps"
      @click="handleFocusOrClick"
      @focus="handleFocusOrClick"
      @keydown="handleKeyDown"
    >
      <!-- Placeholder -->
      <span
        v-if="placeholder && !hasContent"
        class="placeholder"
        :class="placeholderClass"
        :style="placeholderStyle"
      >
        {{ placeholder }}
      </span>

      <!-- Multi & scroller -->
      <HorizontalScroller
        v-if="multi && scroller"
        content-class="flex-gap-x-2"
        arrows="outside"
      >
        <Chip
          v-for="(chip, idx) in modelValue"
          :key="idx"
          :label="getLabel(chip)"
          :to="optionTo?.(chip)"
          :navigate-to-options="{ open: { target: '_blank' } }"
          min-w="20"
          p="!y-1px"
          :class="getChipClass(chip)"
          :style="getChipStyle(chip)"
          :has-remove="!(readonly || disabled)"
          @remove="handleRemove(chip)"
        />
      </HorizontalScroller>

      <!-- Multi -->
      <template v-else-if="multi && model">
        <slot
          name="selection-chips"
          :selected-option="getOption(model)"
        >
          <Chip
            v-for="(chip, idx) in modelValue"
            :key="idx"
            :label="getLabel(chip)"
            :to="optionTo?.(chip)"
            :navigate-to-options="{ open: { target: '_blank' } }"
            :has-remove="!(readonly || disabled) && !noItemsClear"
            min-w="20"
            p="!y-1px"
            :class="getChipClass(chip)"
            :style="getChipStyle(chip)"
            @remove="handleRemove(chip)"
          />
        </slot>
      </template>

      <!-- Single selection -->
      <Component
        :is="componentSingle.component"
        v-else-if="hasContent"
        self-center
        :to="componentSingle.to"
        style="max-width: calc(100% - 12px)"
        :class="[componentSingle.class, { truncate: !noTruncate }]"
        data-onboarding="selector-value"
        @click="componentSingle.onClick"
      >
        {{ getLabel(model) }}
      </Component>
    </Component>

    <template #append>
      <div
        v-if="hasAppendSlot"
        flex="~ gap-x-1 center"
        p="x-2"
        shrink-0
        :class="appendClass"
        @click="handleFocusOrClick"
      >
        <Btn
          v-if="clearable && hasContent && !disabled && !readonly"
          icon="i-eva:close-fill h-6 w-6"
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

        <slot
          name="append"
          :clear="clear"
        />

        <slot
          v-if="!disabled && !readonly && !noDropdownIcon"
          name="dropdown-icon"
          :is-open="isPickerActive"
        >
          <div
            i-fluent:chevron-up-down-24-regular
            class="dropdown-icon"
          />
        </slot>
      </div>
    </template>

    <template #menu>
      <MenuProxy
        ref="menuProxyEl"
        v-model="isPickerActive"
        data-onboarding="selector-menu"
        manual
        position="top"
        class="selector"
        :class="{
          'has-label': !!label,
          'is-menu-width-matched': !noMenuMatchWidth,
        }"
        :offset="noMenuMatchWidth ? 8 : 0"
        :no-arrow="noMenuMatchWidth ? false : true"
        :match-width="!noMenuMatchWidth"
        :reference-target="menuReferenceTarget"
        :fit="false"
        no-uplift
        max-height="50%"
        :ui="{ contentClass: 'p-0' }"
        v-bind="menuProps"
        data-cy="drop-down-list"
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
            v-model:search="search"
            :selected="modelValue || []"
            :item-key="optionKey"
            :item-label="optionLabel"
            v-bind="listProps"
            :class="listClass"
            :has-infinite-scroll="hasInfiniteScroll"
            @search="menuProxyEl?.recomputePosition()"
            @before-search="menuProxyEl?.recomputePosition()"
            @update:selected="handleSelect"
            @added="handleSelectAdd"
            @selected-multiple="handleSelectedMultiple"
            @removed="handleSelectRemove"
          >
            <template
              v-if="$bp.isSmaller('sm') || $slots['after-search']"
              #after-search
            >
              <slot name="after-search" />

              <Btn
                v-if="$bp.isSmaller('sm')"
                preset="CLOSE"
                self-center
                m="r-2"
                @click="isPickerActive = false"
              />
            </template>

            <template #above>
              <slot name="above-options" />
            </template>

            <template #below>
              <slot name="below-options" />

              <template v-if="multi">
                <!-- Confirm button (for lt-sm displays) -->
                <Separator class="!sm:hidden" />

                <Btn
                  sm="!hidden"
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
  @apply truncate max-w-9/10%;
  color: #9ca3af;
}

.dropdown-icon {
  @apply shrink-0 color-ca inline cursor-pointer;
}

.wrapper--sm {
  .dropdown-icon {
    @apply h-3.5 w-3.5;
  }
}

.wrapper--md {
  .dropdown-icon {
    @apply h-4 w-4;
  }
}

.is-active {
  :deep(.label) {
    @apply color-$InputLabel-active-color;
  }

  :deep(.wrapper__body:after) {
    @apply border-primary/50 dark:border-primary/50;
  }
}

@screen md {
  .is-active.is-menu-width-matched.has-menu-bottom {
    :deep(.wrapper__body:after) {
      @apply rounded-b-0;
    }

    :deep(.input-wrapper-border) {
      @apply rounded-b-0 border-primary/40;
    }
  }

  .is-active.is-menu-width-matched.has-menu-top {
    :deep(.wrapper__body:after) {
      @apply rounded-t-0;
    }

    :deep(.input-wrapper-border) {
      @apply rounded-t-0 border-primary/40;
    }
  }
}

.control {
  @apply flex;

  &:not(.has-content)::after {
    @apply color-transparent w-0;

    content: '_';
  }
}

.wrapper--sm {
  .control {
    @apply min-h-6;
  }
}

.wrapper--md {
  .control {
    @apply min-h-26px;
  }
}

.wrapper-lg {
  .control {
    @apply min-h-10;
  }
}
</style>
