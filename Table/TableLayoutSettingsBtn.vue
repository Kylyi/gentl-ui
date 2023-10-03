<script setup lang="ts">
import { config } from '~/config'

// Types
import { ITableLayout } from '~/components/Table/types/table-layout.type'

// Injections
import {
  tableLayoutKey,
  tableLayoutsKey,
  tableQueryKey,
  tableStorageKey,
  tableViewCodeKey,
} from '~/components/Table/provide/table.provide'

// Components
import Dialog from '~/components/Dialog/Dialog.vue'

type IProps = {
  nonSaveableSettings?: Array<'columns' | 'filters' | 'sorting'>
}

const props = withDefaults(defineProps<IProps>(), {
  nonSaveableSettings: () => [],
})

// Injections
const tableQuery = injectStrict(tableQueryKey)
const layouts = injectStrict(tableLayoutsKey)
const currentLayout = injectStrict(tableLayoutKey)
const viewCode = injectStrict(tableViewCodeKey, ref(''))
const _tableStorageKey = injectStrict(tableStorageKey)

// Utils
const { saveLayout, deleteLayout } = useTableSpecifics()
const { handleRequest } = useRequest()

// Layout
const dialogEl = ref<InstanceType<typeof Dialog>>()
const currentLayoutId = ref<number | undefined>(currentLayout.value?.id)
const saveableEntities = ref<Record<string, boolean>>({
  filters: true,
  sorting: true,
})

const layout = ref({
  name: currentLayout.value?.name,
  columns: false,
  sort: false,
  filters: false,
  queryBuilder: false,
  default: false,
  public: false,
})

const nonSaveableSettingsByName = computed(() => {
  return props.nonSaveableSettings?.reduce((agg, curr) => {
    agg[curr] = true

    return agg
  }, {} as Record<string, boolean>)
})

const layoutExists = computed(() => {
  return layouts.value.some(l => l.name === layout.value.name)
})

const isSaveable = computed(() => {
  return (
    (layout.value.filters ||
      layout.value.queryBuilder ||
      layout.value.sort ||
      layout.value.columns) &&
    layout.value.name
  )
})

function handleDialogBeforeShow() {
  layout.value.name =
    currentLayout.value?.name !== $t('table.layoutStateNoLayout')
      ? currentLayout.value?.name
      : ''
  currentLayoutId.value = currentLayout.value?.id

  setDefaults(currentLayout.value)
}

function setDefaults(_layout?: ITableLayout) {
  if (!currentLayout.value || !_layout) {
    return
  }

  const layoutSearchParams = new URLSearchParams(_layout.schema)

  layout.value.columns = layoutSearchParams.has('select')
  layout.value.sort =
    layoutSearchParams.has('paging') &&
    !layoutSearchParams.get('paging')?.toString().startsWith('(sort($key.asc)')
  layout.value.filters = layoutSearchParams.has('and')

  checkSaveable('filters', layout.value.filters)
  checkSaveable('sorting', layout.value.sort)

  layout.value.public = _layout.accessLevel === 4 || _layout.accessLevel === 3

  layout.value.default = _layout.accessLevel === 1 || _layout.accessLevel === 3
}

function checkSaveable(
  entity: 'columns' | 'filters' | 'sorting',
  value?: boolean | null
) {
  if (!value) {
    saveableEntities.value[entity] = true

    return
  }

  switch (entity) {
    case 'filters':
      saveableEntities.value.filters =
        !!tableQuery.value.fetchTableQuery.filters?.length

      return saveableEntities.value.filters

    case 'sorting':
      saveableEntities.value.sorting =
        !!tableQuery.value.fetchTableQuery.orderBy?.length

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
  const isValid = await $v.value.$validate()

  if (!isValid) {
    return
  }

  const queryParams = tableQuery.value.queryParams
  const paramsToSave = new URLSearchParams()

  // Columns
  if (layout.value.columns && queryParams.has('select')) {
    paramsToSave.set('select', `${queryParams.get('select')}`)
  }

  // Sort
  if (layout.value.sort && queryParams.has('paging')) {
    // We need to extract only the `sort` part of the `paging` query param
    const sortPart =
      queryParams.get('paging')?.match(/\(sort\(([^)]+)\)/)?.[1] || ''

    if (sortPart) {
      paramsToSave.set('paging', `(sort(${sortPart}))`)
    }
  }

  // Query builder and filters
  if (layout.value.filters && queryParams.has('and')) {
    paramsToSave.set('and', `${queryParams.get('and')}`)
  }

  const layoutFound = layouts.value.find(l => l.name === layout.value.name)

  const res = await handleRequest<ITableLayout>(
    () => {
      const mode = layoutFound ? 'update' : 'create'

      return saveLayout(
        {
          id: layoutFound?.id,
          name: layout.value.name,
          schema: decodeURIComponent(paramsToSave.toString()),
          viewCode: viewCode.value,
          accessLevel: accessLevel.value,
          tableName: _tableStorageKey.value,
        },
        { mode }
      )
    },
    { notifySuccess: true }
  )

  // When we create a new layout, we add it to the layouts array
  if (!layoutFound) {
    layouts.value = [...layouts.value, res]
  }

  // When we update a layout, we update the layout in the layouts array
  else {
    Object.assign(layoutFound, res)
  }

  // When we make some layout default, we make sure the other layouts are not default
  if (layout.value.default) {
    layouts.value = layouts.value.map(l => {
      if (l.id === res.id) {
        return res
      }

      const wasPublicPublicAndDefault = l.accessLevel === 3

      return { ...l, accessLevel: wasPublicPublicAndDefault ? 4 : 2 }
    })
  }

  currentLayout.value = res
  dialogEl.value?.hide()
}

async function handleDeleteLayoutState() {
  const deletedFilterId = await handleRequest(
    () => deleteLayout(currentLayoutId.value),
    { notifySuccess: true, payloadKey: 'data.payload.id' }
  )

  layouts.value = layouts.value.filter(l => l.id !== deletedFilterId)
  currentLayout.value = undefined

  reset()
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
  $v.value.$reset()
}

function handleLayoutSelect(_layout: ITableLayout & { _isCreate?: boolean }) {
  layout.value.name = _layout.name
  currentLayoutId.value = _layout._isCreate ? undefined : _layout.id

  setDefaults(_layout)
}

const $v = useVuelidate(
  { layout: { name: { required, maxLength: maxLength(64) } } },
  { layout },
  { $scope: false }
)
</script>

<template>
  <Btn
    icon="solar:settings-linear"
    size="sm"
    color="ca"
    no-uppercase
    :label="$t('settings')"
    label-class="hidden sm:block"
    data-cy="settings"
  >
    <Dialog
      ref="dialogEl"
      dense
      header-class="p-l-3 p-r-1"
      :title="$t('table.layoutSave')"
      w="150"
      h="122"
      @hide="reset"
      @before-show="handleDialogBeforeShow"
    >
      <Form
        p="2"
        :label="layoutExists ? $t('save') : $t('saveAs')"
        :submit-disabled="!isSaveable"
        @submit="handleSaveLayout"
      >
        <Selector
          :model-value="layout.name"
          :options="layouts"
          allow-add
          option-label="name"
          :label="$t('table.layoutName')"
          :errors="$v.layout.name.$errors"
          stack-label
          no-highlight
          :hint="$t('general.addNewItemByTyping')"
          @update:model-value="handleLayoutSelect"
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
              {{ $t('table.layoutSaveEntities') }}
            </span>

            <!-- Columns -->
            <Toggle
              v-if="!nonSaveableSettingsByName.columns"
              v-model="layout.columns"
              container-class="bg-white dark:bg-darker col-start-1"
              :label="$t('table.saveColumns')"
            />

            <!-- Filters -->
            <Toggle
              v-if="!nonSaveableSettingsByName.filters"
              v-model="layout.filters"
              container-class="bg-white dark:bg-darker col-start-1"
              :label="$t('table.saveFilters')"
              @update:model-value="checkSaveable('filters', $event)"
            >
              <template
                v-if="!saveableEntities.filters"
                #append
              >
                <div>
                  <div class="clarity:warning-solid color-amber-500" />

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
              container-class="col-start-1 bg-white dark:bg-darker"
              :label="$t('table.saveSort')"
              col="start-1"
              @update:model-value="checkSaveable('sorting', $event)"
            >
              <template
                v-if="!saveableEntities.sorting"
                #append
              >
                <div>
                  <div class="clarity:warning-solid color-amber-500" />

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
          <div flex="~ col gap-1">
            <span
              text="caption"
              font="bold"
            >
              {{ $t('table.layoutSaveOptions') }}
            </span>

            <!-- Public -->
            <Toggle
              v-model="layout.public"
              container-class="bg-white dark:bg-darker"
              :label="$t('table.savePublic')"
            />

            <!-- Default -->
            <Toggle
              v-if="!config.table.useLocalStorageForDefaultLayout"
              v-model="layout.default"
              container-class="bg-white dark:bg-darker"
              :label="$t('table.saveDefault')"
            />
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
  </Btn>
</template>
