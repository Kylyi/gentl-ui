<script setup lang="ts">
import { klona } from 'klona/full'
import { config } from '~/components/config/components-config'

// Types
import type { ITableLayout } from '~/components/Table/types/table-layout.type'

// Injections
import {
  tableLayoutKey,
  tableLayoutsKey,
  tableQueryKey,
  tableStorageKey,
  tableViewCodeKey,
} from '~/components/Table/provide/table.provide'

// Store
import { useTableStore } from '~/components/Table/table.store'

// Components
import Dialog from '~/components/Dialog/Dialog.vue'

type IProps = {
  nonSavableSettings?: Array<'columns' | 'filters' | 'sorting' | 'public'>
  search?: string
}

const props = withDefaults(defineProps<IProps>(), {
  nonSavableSettings: () => [],
})

const emits = defineEmits<{
  (e: 'beforeShow'): void
  (e: 'beforeHide'): void
}>()

// Store
const { getTableState, setTableState } = useTableStore()

// Injections
const tableQuery = injectStrict(tableQueryKey)
const layouts = injectStrict(tableLayoutsKey)
const currentLayout = injectStrict(tableLayoutKey)
const viewCode = injectStrict(tableViewCodeKey, ref(''))
const _tableStorageKey = injectStrict(tableStorageKey)

// Utils
const { saveLayout, deleteLayout } = useTableSpecifics()
const { isLoading, handleRequest } = useRequest()

// Layout
const dialogEl = ref<InstanceType<typeof Dialog>>()
const currentLayoutId = ref<number | string | undefined>(currentLayout.value?.id)
const saveableEntities = ref<Record<string, boolean>>({
  filters: true,
  sorting: true,
})

const layout = ref({
  name: currentLayout.value?.name || props.search || '',
  columns: false,
  sort: false,
  filters: false,
  queryBuilder: false,
  default: false,
  public: false,
})
const layoutClone = ref<typeof layout.value>()

const hasLayoutChanged = computedEager(() => {
  return !isEqual(layout.value, layoutClone.value)
})

const nonSaveableSettingsByName = computed(() => {
  return props.nonSavableSettings?.reduce((agg, curr) => {
    agg[curr] = true

    return agg
  }, {} as Record<string, boolean>)
})

const isSaveable = computed(() => {
  const hasColumnFilters = layout.value.filters
  const hasQueryBuilderFilters = layout.value.queryBuilder
  const hasSort = layout.value.sort
  const hasColumns = layout.value.columns

  const hasAnything = hasColumnFilters || hasQueryBuilderFilters || hasSort || hasColumns

  return hasAnything && layout.value.name
})

const hasSaveLayoutOptions = computed(() => {
  return (
    config.table.canSaveLayoutAsPublic
    && !nonSaveableSettingsByName.value.public
  )
})

function handleDialogBeforeShow() {
  layout.value.name = currentLayout.value?.name !== $t('table.layoutStateNoLayout')
    ? currentLayout.value?.name || props.search || ''
    : ''
  currentLayoutId.value = currentLayout.value?.id

  setDefaults(currentLayout.value)
  layoutClone.value = klona(layout.value)

  emits('beforeShow')
}

function setDefaults(_layout?: ITableLayout) {
  if (!currentLayout.value || !_layout) {
    return
  }

  const layoutSearchParams = new URLSearchParams(_layout.schema)

  layout.value.columns = layoutSearchParams.has('select')
  layout.value.sort
    = layoutSearchParams.has('paging')
    && !layoutSearchParams.get('paging')?.toString().startsWith('(sort($key.asc)')
  layout.value.filters = layoutSearchParams.has('and')

  checkSaveable('filters', layout.value.filters)
  checkSaveable('sorting', layout.value.sort)

  layout.value.public = _layout.accessLevel === 4 || _layout.accessLevel === 3

  layout.value.default = _layout.accessLevel === 1 || _layout.accessLevel === 3
}

function checkSaveable(
  entity: 'columns' | 'filters' | 'sorting',
  value?: boolean | null,
) {
  if (!value) {
    saveableEntities.value[entity] = true

    return
  }

  switch (entity) {
    case 'filters':
      saveableEntities.value.filters
        = !!tableQuery.value.fetchTableQuery.filters?.length

      return saveableEntities.value.filters

    case 'sorting':
      saveableEntities.value.sorting
        = !!tableQuery.value.fetchTableQuery.orderBy?.length

      return saveableEntities.value.sorting
  }
}

const accessLevel = computed(() => {
  if (layout.value.default && layout.value.public) {
    return 3
  }

  if (layout.value.default) {
    return 1
  }

  if (layout.value.public) {
    return 4
  }

  return 2
})

// Queries
async function handleSaveLayout() {
  const res = await handleRequest(
    () => {
      const mode = currentLayoutId.value ? 'update' : 'create'
      const toSave: Array<'columns' | 'filters' | 'sorting'> = []

      if (layout.value.columns) {
        toSave.push('columns')
      }

      if (layout.value.filters) {
        toSave.push('filters')
      }

      if (layout.value.sort) {
        toSave.push('sorting')
      }

      return saveLayout(
        {
          id: currentLayoutId.value,
          name: layout.value.name,
          schema: tableQuery.value.queryParams.toString(),
          viewCode: viewCode.value,
          accessLevel: accessLevel.value,
          tableName: _tableStorageKey.value,
        },
        toSave,
        { mode, tableQuery: tableQuery.value },
      )
    },
    { $z, notifySuccess: true, logging: { operationName: 'table.layoutSave' } },
  )

  // When we create a new layout, we add it to the layouts array
  if (!currentLayoutId.value) {
    layouts.value = [...layouts.value, res]
  }

  // When we update a layout, we update the layout in the layouts array
  else {
    Object.assign(currentLayout.value!, res)

    const foundLayout = layouts.value.find(l => l.id === res.id)
    if (foundLayout) {
      Object.assign(foundLayout, res)
    }
  }

  // When we make some layout default, we make sure the other layouts are not default
  // Also set the default as a reference for `Reset layout` button
  if (layout.value.default) {
    layouts.value = layouts.value.map(l => {
      if (l.id === res.id) {
        return res
      }

      const wasPublicPublicAndDefault = l.accessLevel === 3

      return { ...l, accessLevel: wasPublicPublicAndDefault ? 4 : 2 }
    })

    // Set the default layout in the table state
    const tableState = getTableState(_tableStorageKey.value)

    if (tableState.value.meta) {
      set(tableState.value.meta, config.table.defaultLayoutKey, res)
    }

    setTableState(_tableStorageKey.value, {
      meta: tableState.value.meta,
    })
  }

  currentLayout.value = res
  dialogEl.value?.hide()
}

async function handleDeleteLayoutState() {
  const deletedFilterId = await handleRequest(
    () => deleteLayout(currentLayoutId.value, _tableStorageKey.value),
    {
      notifySuccess: true,
      noResolve: true,
      logging: { operationName: 'table.layoutDelete' },
    },
  )

  layouts.value = layouts.value.filter(l => l.id !== deletedFilterId)

  if (currentLayout.value?.id === deletedFilterId) {
    currentLayout.value = undefined
  }

  reset()
  dialogEl.value?.hide()
}

function reset() {
  currentLayoutId.value = undefined
  layout.value = {
    name: '',
    columns: false,
    sort: false,
    filters: false,
    queryBuilder: false,
    default: false,
    public: false,
  }

  $z.value.$reset()
}

const $z = useZod(
  {
    layout: z.object({
      name: z.string(),
    }),
  },
  { layout },
)
</script>

<template>
  <Dialog
    ref="dialogEl"
    dense
    header-class="p-l-3 p-r-1"
    :title="$t('table.layoutSave')"
    w="150"
    h="122"
    @hide="reset"
    @before-show="handleDialogBeforeShow"
    @before-hide="$emit('beforeHide')"
  >
    <Form
      p="2"
      :label="$t('general.save')"
      :submit-disabled="!isSaveable || !hasLayoutChanged"
      :ui="{ submitClass: 'w-40' }"
      :loading="isLoading"
      :submit-confirmation="false"
      focus-first-input
      no-shortcuts
      @submit="handleSaveLayout"
    >
      <TextInput
        v-model="layout.name"
        :label="$t('table.layoutName')"
        layout="regular"
        :validation="$z.layout?.name"
      />

      <Separator spaced />

      <div
        bg="dark:darker white"
        grid="~ md:cols-2 gap-1"
        rounded="custom"
        p="1 t-2"
      >
        <!-- Left side -->
        <div flex="~ col gap-1">
          <span
            text="caption"
            font="bold"
          >
            {{
              currentLayoutId
                ? $t('table.layoutSavedEntities')
                : $t('table.layoutSaveEntities')
            }}
          </span>

          <!-- Columns -->
          <Toggle
            v-if="!nonSaveableSettingsByName.columns"
            v-model="layout.columns"
            :readonly="!!currentLayoutId"
            container-class="bg-white dark:bg-darker col-start-1"
            :label="$t('table.saveColumns')"
          >
            <template #prepend>
              <div class="i-tabler:columns-2 color-blue-500" />
            </template>
          </Toggle>

          <!-- Filters -->
          <Toggle
            v-if="!nonSaveableSettingsByName.filters"
            v-model="layout.filters"
            :readonly="!!currentLayoutId"
            container-class="bg-white dark:bg-darker col-start-1"
            :label="$t('table.saveFilters')"
            @update:model-value="checkSaveable('filters', $event)"
          >
            <template #prepend>
              <div class="i-ic:round-filter-alt color-blue-500" />
            </template>

            <template
              v-if="!saveableEntities.filters"
              #append
            >
              <div>
                <div class="i-clarity:warning-solid color-amber-500" />

                <Tooltip
                  :offset="8"
                  flex="~ col center"
                >
                  <span color="amber-500">
                    {{ $t('table.emptyFilters') }}
                  </span>
                  <span text="caption xs">
                    {{ $t('general.willBeIgnored') }}
                  </span>
                </Tooltip>
              </div>
            </template>
          </Toggle>

          <!-- Sort -->
          <Toggle
            v-if="!nonSaveableSettingsByName.sorting"
            v-model="layout.sort"
            :readonly="!!currentLayoutId"
            container-class="col-start-1 bg-white dark:bg-darker"
            :label="$t('table.saveSort')"
            col="start-1"
            @update:model-value="checkSaveable('sorting', $event)"
          >
            <template #prepend>
              <div class="i-basil:sort-outline color-blue-500" />
            </template>

            <template
              v-if="!saveableEntities.sorting"
              #append
            >
              <div>
                <div class="i-clarity:warning-solid color-amber-500" />

                <Tooltip
                  :offset="8"
                  flex="~ col center"
                >
                  <span color="amber-500">
                    {{ $t('table.emptySorting') }}
                  </span>
                  <span text="caption xs">
                    {{ $t('general.willBeIgnored') }}
                  </span>
                </Tooltip>
              </div>
            </template>
          </Toggle>
        </div>

        <!-- Right side -->
        <div
          v-if="hasSaveLayoutOptions"
          flex="~ col gap-1"
        >
          <span
            text="caption"
            font="bold"
          >
            {{ $t('table.layoutSaveOptions') }}
          </span>

          <!-- Public -->
          <Toggle
            v-if=" !nonSaveableSettingsByName.public && config.table.canSaveLayoutAsPublic "
            v-model="layout.public"
            container-class="bg-white dark:bg-darker"
            :label="$t('table.savePublic')"
          >
            <template #prepend>
              <div class="i-ic:round-public color-blue-500" />
            </template>
          </Toggle>

          <!-- Default -->
          <Toggle
            v-if="config.table.canSaveLayoutAsDefault"
            v-model="layout.default"
            container-class="bg-white dark:bg-darker"
            :label="$t('table.saveDefault')"
          >
            <template #prepend>
              <div class="i-fluent:book-default-28-filled color-blue-500" />
            </template>
          </Toggle>
        </div>
      </div>

      <!-- Filler -->
      <div grow />

      <Banner
        v-if="!isSaveable"
        type="info"
        outlined
        :label="$t('table.layoutStateAtLeastOneEntityToSave')"
      />

      <template
        v-if="currentLayoutId"
        #submit-before
      >
        <CrudBtnDelete
          :label="$t('table.layoutStateDelete')"
          labels
          @delete="handleDeleteLayoutState"
        />
      </template>
    </Form>
  </Dialog>
</template>
