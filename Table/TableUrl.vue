<script setup lang="ts">
// INJECTION KEYS
import { tableQueryKey } from '~/components/Table/provide/table.provide'

// INJECTIONS
const tableQuery = injectStrict(tableQueryKey)

// UTILS
const { copy, copied } = useClipboard()

function handleCopyUrl() {
  const { options, where } = tableQuery.value
  const url = new URL(window.location.href)

  // Clear all the search params
  url.search = ''

  // Pagination
  url.searchParams.set('page', String(options.skip / options.take + 1))
  url.searchParams.set('perPage', String(options.take))

  // Filters
  Object.entries(where).forEach(([field, val]) => {
    Object.entries(val).forEach(([comparator, value]) => {
      url.searchParams.append(field, `${comparator}.${value}`)
    })
  })

  // Sorting
  Object.entries(options.orderBy).forEach(([field, direction]) => {
    url.searchParams.append('sort', `${field}.${direction}`)
  })

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
