<script setup lang="ts">
// Injections
import { tableQueryKey } from '~/components/Table/provide/table.provide'

// Functions
import { serializeFilterString } from '~/components/Table/utils/transformTableQueryToQueryParams'

// Injections
const tableQuery = injectStrict(tableQueryKey)

// Layout
const layout = ref({
  name: '',
  columns: false,
  sort: false,
  filters: false,
  queryBuilder: false,
  default: false,
  public: false,
})

async function handleSaveLayout() {
  const isValid = await $v.value.$validate()

  if (!isValid) {
    return
  }

  const queryParams = tableQuery.value.queryParams
  const paramsToSave = new URLSearchParams()

  // Columns
  if (layout.value.columns && queryParams.has('select')) {
    paramsToSave.set('columns', queryParams.get('select')!)
  }

  // Sort
  if (layout.value.sort && queryParams.has('order')) {
    paramsToSave.set('order', queryParams.get('order')!)
  }

  // Filters
  if (layout.value.filters && tableQuery.value.tableQuery.columnFilters) {
    paramsToSave.set(
      'filter',
      serializeFilterString(tableQuery.value.tableQuery.columnFilters)
    )
  }

  // Query builder
  if (layout.value.queryBuilder && tableQuery.value.tableQuery.queryBuilder) {
    paramsToSave.set(
      'qb',
      serializeFilterString(tableQuery.value.tableQuery.queryBuilder)
    )
  }

  // Default
  if (layout.value.default) {
    paramsToSave.set('default', 'true')
  }

  // Public
  if (layout.value.public) {
    paramsToSave.set('public', 'true')
  }

  console.log('Saving layout...', paramsToSave.toString())
}

function reset() {
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

const $v = useVuelidate(
  {
    layout: {
      name: { required },
    },
  },
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
      dense
      header-class="p-l-3 p-r-1"
      :title="$t('table.layoutSave')"
      w="150"
      @hide="reset"
    >
      <Form
        p="2"
        :label="$t('save')"
        @submit="handleSaveLayout"
      >
        <TextInput
          v-model="layout.name"
          :label="$t('table.layoutName')"
          :placeholder="$t('table.layoutNamePlaceholder')"
          col="span-2"
          :errors="$v.layout.name.$errors"
        />

        <Separator spaced />

        <div
          grid="~ md:cols-2 gap-1"
          p="t-4"
        >
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
          <Toggle
            v-model="layout.queryBuilder"
            container-class="bg-white dark:bg-darker"
            :label="$t('table.saveQueryBuilder')"
          />

          <!-- Sort -->
          <Toggle
            v-model="layout.sort"
            container-class="col-start-1 bg-white dark:bg-darker"
            :label="$t('table.saveSort')"
          />
        </div>
      </Form>
    </Dialog>
  </Btn>
</template>
