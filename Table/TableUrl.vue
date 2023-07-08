<script setup lang="ts">
// Functions
import { getTableStateDefault } from '~/components/Table/constants/table-state.default'

// Injections
import { tableGetTableQueryKey } from '~/components/Table/provide/table.provide'

// UTILS
const { copy, copied } = useClipboard()
const { pageSize } = getTableStateDefault()

// Layout
const getTableQuery = injectStrict(tableGetTableQueryKey)

function handleCopyUrl() {
  const { options, where } = getTableQuery()
  const url = new URL(window.location.href)

  // Clear all the search params
  url.search = ''

  // Pagination
  url.searchParams.set(
    'page',
    String((options.skip || 0) / (options.take ?? pageSize) + 1)
  )
  url.searchParams.set('perPage', String(options.take ?? pageSize))

  // Filters
  Object.entries(where || {}).forEach(([field, val]) => {
    Object.entries(val).forEach(([comparator, value]) => {
      url.searchParams.append(field, `${comparator}.${value}`)
    })
  })

  // Sorting
  // FIXME: Broken sorting
  // Object.entries(options.orderBy).forEach(([field, direction]) => {
  //   url.searchParams.append('sort', `${field}.${direction}`)
  // })

  // Searching
  if (options.search) {
    url.searchParams.set('search', options.search)
  }

  copy(url.toString())
}
</script>

<template>
  <Btn
    :label="$t('table.urlCopy')"
    no-uppercase
    icon="ph:link"
    m="3"
    @click="handleCopyUrl"
  >
    <BtnConfirmation
      :model-value="copied"
      :label="$t('copied')"
      position="top"
    />
  </Btn>
</template>
