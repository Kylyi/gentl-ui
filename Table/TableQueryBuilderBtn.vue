<script setup lang="ts">
import { klona } from 'klona'

// Types
import { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'

// Injections
import {
  tableNonHelpersColumnsKey,
  tableRefreshKey,
} from '~/components/Table/provide/table.provide'

// Components
import Dialog from '~/components/Dialog/Dialog.vue'
import QueryBuilder from '~/components/QueryBuilder/QueryBuilder.vue'

type IProps = {
  queryBuilder: IQueryBuilderRow[]
}

const props = defineProps<IProps>()
defineEmits<{
  (e: 'update:queryBuilder', queryBuilder: IQueryBuilderRow[]): void
}>()

// Injections
const nonHelperColumns = injectStrict(tableNonHelpersColumnsKey, ref([]))
const tableRefresh = injectStrict(tableRefreshKey, () => {})

// Layout
const queryBuilderEl = ref<InstanceType<typeof QueryBuilder>>()
const dialogEl = ref<InstanceType<typeof Dialog>>()
const queryBuilder = useVModel(props, 'queryBuilder')
const { sync, cloned } = useCloned(queryBuilder, { clone: klona })

async function syncToParent() {
  const isValid = await $v.value.$validate()

  if (!isValid) {
    return
  }

  queryBuilder.value = cloned.value

  // When using column filters in query builder, we also need to sync the column filters
  // if (config.table.queryBuilder.showColumnFilters) {
  //   const columnFiltersExtracted = nonHelperColumns.value.flatMap(
  //     col => col.filters
  //   )
  //   console.log(
  //     'Log ~ syncToParent ~ columnFiltersExtracted:',
  //     columnFiltersExtracted
  //   )

  //   nonHelperColumns.value.forEach(col => {
  //     const colColumnFilters = columnFiltersExtracted.filter(
  //       filter => filter.field === col.field
  //     )
  //     console.log('Log ~ syncToParent ~ colColumnFilters:', colColumnFilters)

  //     col.filters = colColumnFilters
  //   })
  // }
  queryBuilderEl.value?.syncFilters()

  dialogEl.value?.hide()
}

function handleSync() {
  sync()
  tableRefresh()
}

const $v = useVuelidate({ $scope: 'qb' })
</script>

<template>
  <Btn
    size="sm"
    no-uppercase
    outlined
    color="ca"
    icon="basil:filter-solid"
    :label="$t('queryBuilder.self')"
  >
    <Dialog
      ref="dialogEl"
      :title="$t('queryBuilder.self')"
      w="220"
      max-h="90%"
      min-h="100"
      h="auto"
      dense
      header-class="p-l-3 p-r-1"
      @before-hide="handleSync"
    >
      <Form
        :label="$t('apply')"
        @submit="syncToParent"
      >
        <QueryBuilder
          ref="queryBuilderEl"
          v-model:items="cloned"
          :columns="nonHelperColumns"
        />
      </Form>
    </Dialog>
  </Btn>
</template>
