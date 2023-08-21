<script setup lang="ts">
import { klona } from 'klona'

// Types
import { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'

// Injections
import { tableNonHelpersColumnsKey } from '~/components/Table/provide/table.provide'

// Components
import Dialog from '~/components/Dialog/Dialog.vue'

type IProps = {
  queryBuilder: IQueryBuilderRow[]
}

const props = defineProps<IProps>()

// Injections
const nonHelperColumns = injectStrict(tableNonHelpersColumnsKey, ref([]))

// Layout
const dialogEl = ref<InstanceType<typeof Dialog>>()
const queryBuilder = useVModel(props, 'queryBuilder')
const { sync, cloned } = useCloned(queryBuilder, { clone: klona })

async function syncToParent() {
  const isValid = await $v.value.$validate()

  if (!isValid) {
    return
  }

  queryBuilder.value = cloned.value
  dialogEl.value?.hide()
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
      w="264"
      max-h="90%"
      min-h="100"
      h="auto"
      dense
      header-class="p-l-3 p-r-1"
      @hide="sync"
    >
      <Form
        :label="$t('apply')"
        p="2"
        @submit="syncToParent"
      >
        <QueryBuilder
          v-model:items="cloned"
          :columns="nonHelperColumns"
        />
      </Form>
    </Dialog>
  </Btn>
</template>
