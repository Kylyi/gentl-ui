<script setup lang="ts">
import { klona } from 'klona'

// Types
import { type IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'

// Injections
import {
  tableNonHelperColumnsKey,
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
const nonHelperColumns = injectStrict(tableNonHelperColumnsKey, ref([]))
const tableRefresh = injectStrict(tableRefreshKey, () => {})

// Layout
const queryBuilderEl = ref<InstanceType<typeof QueryBuilder>>()
const dialogEl = ref<InstanceType<typeof Dialog>>()
const queryBuilder = useVModel(props, 'queryBuilder')
const { sync, cloned } = useCloned(queryBuilder, { clone: klona })

const queryBuilderHasChildren = computed(() => {
  return queryBuilder.value.some(
    item => 'children' in item && item.children?.length
  )
})

async function syncToParent() {
  const isValid = await $z.value.$validate()

  if (!isValid) {
    return
  }

  queryBuilder.value = cloned.value
  queryBuilderEl.value?.syncFilters()

  dialogEl.value?.hide()
}

function handleSync() {
  sync()
  tableRefresh()
}

const $z = useZod({ scope: 'qb' })
</script>

<template>
  <Btn
    size="sm"
    no-uppercase
    outlined
    :class="queryBuilderHasChildren ? 'color-primary' : 'color-ca'"
    icon="basil:filter-solid"
  >
    <Tooltip
      placement="top"
      :offset="8"
    >
      {{ $t('queryBuilder.self') }}
    </Tooltip>

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
        :label="$t('general.apply')"
        :submit-confirmation="false"
        @submit="syncToParent"
      >
        <QueryBuilder
          ref="queryBuilderEl"
          v-model:items="cloned"
          :columns="nonHelperColumns"
          editable
        />
      </Form>
    </Dialog>
  </Btn>
</template>
