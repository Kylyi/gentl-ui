// Types
import type { IItem } from '~/libs/Shared/types/item.type'
import type {
  ITableDataFetchFncInput,
  ITableFilterItem,
} from '~/components/Table/types/table-query.type'

// Functions
import { useFiltering } from '~/libs/Shared/functions/data/useFiltering'
import { useSorting } from '~/libs/Shared/functions/data/useSorting'

export function useTableDataClient() {
  // Utils
  const { sortData } = useSorting()
  const { filterData } = useFiltering()

  async function handleLocalFetch<T = IItem>(
    dataRef: MaybeRefOrGetter<T[]>,
    tableFetchInput: ITableDataFetchFncInput,
    options?: { take?: number },
  ) {
    const { columnFilters, orderBy } = tableFetchInput.fetchTableQuery

    const filtered = filterData(
      dataRef,
      columnFilters || ([] as ITableFilterItem<any>[]),
    )
    const rows = await sortData(filtered, orderBy || [])

    const { skip = 0, take = rows.length } = tableFetchInput.fetchTableQuery
    const paginatedRows = rows.slice(skip, skip + (options?.take ?? take))

    return { rows: paginatedRows, totalRows: rows?.length }
  }

  return {
    handleLocalFetch,
  }
}
