<script setup lang="ts">
// Types
import { ITableLayout } from '~/components/Table/types/table-layout.type'

// Injections
import {
  tableLayoutKey,
  tableLayoutsKey,
  tableQueryKey,
} from '~/components/Table/provide/table.provide'

// Functions

// Components
import Dialog from '~/components/Dialog/Dialog.vue'

// Injections
const tableQuery = injectStrict(tableQueryKey)
const layouts = injectStrict(tableLayoutsKey)
const currentLayout = injectStrict(tableLayoutKey)

// Utils
const { handleRequest } = useRequest()

// Layout
const dialogEl = ref<InstanceType<typeof Dialog>>()
const currentLayoutId = ref<number | undefined>(currentLayout.value?.id)

const layout = ref({
  name: currentLayout.value?.name,
  columns: false,
  sort: false,
  filters: false,
  queryBuilder: false,
  default: false,
  public: false,
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
    currentLayout.value?.name !== $t('table.layoutStateDefault')
      ? currentLayout.value?.name
      : ''
  currentLayoutId.value = currentLayout.value?.id

  if (currentLayout.value) {
    const layoutSearchParams = new URLSearchParams(currentLayout.value.schema)

    layout.value.columns = layoutSearchParams.has('select')
    layout.value.sort =
      layoutSearchParams.has('paging') &&
      !layoutSearchParams
        .get('paging')
        ?.toString()
        .startsWith('(sort($key.asc)')
    layout.value.filters = layoutSearchParams.has('and')

    layout.value.public =
      currentLayout.value.accessLevel === 4 ||
      currentLayout.value.accessLevel === 3

    layout.value.default =
      currentLayout.value.accessLevel === 1 ||
      currentLayout.value.accessLevel === 3
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
    paramsToSave.set('paging', `${queryParams.get('paging')}`)
  }

  // Query builder and filters
  if (layout.value.filters && queryParams.has('and')) {
    paramsToSave.set('and', `${queryParams.get('and')}`)
  }

  const layoutFound = layouts.value.find(l => l.name === layout.value.name)

  const res = await handleRequest<any>(
    () => {
      const method = layoutFound ? 'PUT' : 'POST'

      // TODO: Move to some project-specific config
      return axios({
        url: 'user-filters',
        method,
        data: {
          accessLevel: accessLevel.value,
          id: layoutFound?.id,
          name: layout.value.name,
          schema: decodeURIComponent(paramsToSave.toString()),
          viewCode: 'L', // Wtf is this?
        },
      })
    },
    { notifySuccess: true }
  )

  // When we create a new layout, we add it to the layouts array
  if (!layoutFound) {
    layouts.value = [...layouts.value, res.data.payload]
  }

  // When we update a layout, we update the layout in the layouts array
  else {
    Object.assign(layoutFound, res.data.payload)
  }

  currentLayout.value = res.data.payload
  dialogEl.value?.hide()
}

async function handleDeleteLayoutState() {
  const res = await handleRequest(
    () => {
      // TODO: Move to some project-specific config
      return axios({
        url: `user-filters`,
        method: 'DELETE',
        data: { id: currentLayoutId.value },
      })
    },
    { notifySuccess: true }
  )

  const deletedFilterId = res.data.payload.id
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
}

const $v = useVuelidate(
  { layout: { name: { required } } },
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
          :hint="$t('general.addNewItemByTyping')"
          @update:model-value="handleLayoutSelect"
        />

        <Separator spaced />

        <div
          bg="dark:darker white"
          grid="~ md:cols-2 gap-1"
          rounded="custom"
          p="1"
        >
          <Heading>
            {{ $t('table.layoutSaveEntities') }}
          </Heading>

          <Heading>
            {{ $t('table.layoutSaveOptions') }}
          </Heading>

          <!-- Columns -->
          <Toggle
            v-model="layout.columns"
            container-class="bg-white dark:bg-darker"
            :label="$t('table.saveColumns')"
          />

          <!-- Default -->
          <Toggle
            v-model="layout.default"
            container-class="bg-white dark:bg-darker"
            :label="$t('table.saveDefault')"
          />

          <!-- Filters -->
          <Toggle
            v-model="layout.filters"
            container-class="bg-white dark:bg-darker"
            :label="$t('table.saveFilters')"
          />

          <!-- Public -->
          <Toggle
            v-model="layout.public"
            container-class="bg-white dark:bg-darker"
            :label="$t('table.savePublic')"
          />

          <!-- Query builder -->
          <!-- <Toggle
            v-model="layout.queryBuilder"
            container-class="bg-white dark:bg-darker"
            :label="$t('table.saveQueryBuilder')"
          /> -->

          <!-- Sort -->
          <Toggle
            v-model="layout.sort"
            container-class="col-start-1 bg-white dark:bg-darker"
            :label="$t('table.saveSort')"
          />
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
