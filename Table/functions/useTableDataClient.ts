// Types
import type { IItem } from '~/libs/App/types/item.type'
import type {
  ITableDataFetchFncInput,
  ITableFilterItem,
} from '~/components/Table/types/table-query.type'

// Functions
import { useFiltering } from '~/libs/App/data/functions/useFiltering'
import { useSorting } from '~/libs/App/data/functions/useSorting'

export function useTableDataClient() {
  // Utils
  const { sortData } = useSorting()
  const { filterData } = useFiltering()

  async function handleLocalFetch<T = IItem>(
    dataRef: MaybeRefOrGetter<T[]>,
    tableFetchInput: ITableDataFetchFncInput
  ) {
    const { columnFilters, orderBy } = tableFetchInput.fetchTableQuery

    const filtered = filterData(
      dataRef,
      columnFilters || ([] as ITableFilterItem<any>[])
    )
    const rows = await sortData(filtered, orderBy || [])

    return { rows, totalRows: toValue(dataRef)?.length }
  }

  return {
    handleLocalFetch,
  }
}
