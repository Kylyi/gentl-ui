import { config } from '~/components/config/components-config'

// Types
import type { IQueryBuilderProps } from '~/components/QueryBuilder/types/query-builder-props.type'
import type { IQueryBuilderItem } from '~/components/QueryBuilder/types/query-builder-item-props.type'
import type { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'
import type { IQueryBuilderGroup } from '~/components/QueryBuilder/types/query-builder-group-props.type'

// Models
import { FilterItem } from '~/libs/Shared/models/filter-item'

// Injections
import { qbIsActivelyModifyingValuesKey } from '~/components/QueryBuilder/provide/query-builder.provide'

export function useQueryBuilderColumnFilters(
  props: Pick<IQueryBuilderProps, 'columns'>
) {
  const isActivelyModifyingValues = ref(false)

  provide(qbIsActivelyModifyingValuesKey, isActivelyModifyingValues)

  const columnFilters = computed(() => {
    const filters = props.columns
      .flatMap(col => col.filterDbQuery || [])
      .filter(filter => !filter.nonInteractive)
      .map(filter => {
        return {
          id: generateUUID(),
          field: filter.field,
          filterField: filter.filterField,
          comparator: filter.comparator,
          value: filter.value,
          path: `column_filters.${filter.id}`,
          ref: filter,
          isNotDraggable: true,
          isNotDragOverable: true,
        }
      }) as IQueryBuilderItem[]

    if (!filters.length) {
      return []
    }

    return [
      {
        id: generateUUID(),
        children: filters,
        condition: 'AND',
        isGroup: true,
        path: 'column_filters',
        isNotDraggable: true,
        isNotDragOverable: true,
      } as IQueryBuilderRow,
    ]
  })

  const qbColumnFilters = ref(columnFilters.value)
  const originalFiltersByField = props.columns.reduce((agg, col) => {
    agg[col.field] = col.filters.map(
      filter => new FilterItem({ ...filter, format: col.format })
    )

    return agg
  }, {} as Record<string | number, FilterItem[]>)

  /**
   * Syncs query builder column filters into column filters
   */
  function syncFilters(revert?: boolean) {
    // In some cases, we want to revert the query builder columns back to its
    // original state (when we cancel the query builder withou applying for example)
    if (revert) {
      props.columns.forEach(col => {
        col.filters = originalFiltersByField[col.field]
      })

      return
    }

    // We get only the children of the first group, which are the filters
    const _columnFilters = (columnFilters.value[0] as IQueryBuilderGroup)
      ?.children as IQueryBuilderItem[]

    if (
      !config.table.queryBuilder.showColumnFilters ||
      !_columnFilters?.length
    ) {
      return
    }

    _columnFilters.forEach(filter => {
      const isSameField = filter.ref?.field === filter.field

      // When we haven't modified the field, we just update the comparator and value
      if (isSameField && filter.ref) {
        filter.ref.comparator = filter.comparator
        filter.ref.value = filter.value
      }

      // Otherwise, we need to move the filter to the correct column
      else {
        // We remove the filter from the previous column
        removeItem(filter)

        // We move the filter to the new column
        const newColumn = props.columns.find(col => col.field === filter.field)

        if (newColumn) {
          newColumn.filters.push(
            new FilterItem({
              ...newColumn,
              comparator: filter.comparator,
              value: filter.value,
            })
          )
        }
      }
    })
  }

  function removeItem(item: IQueryBuilderItem) {
    if (!item.ref) {
      return
    }

    const { id, field } = item.ref as FilterItem
    const col = props.columns.find(col => col.field === field)
    const filterIdx = col?.filters.findIndex(filter => filter.id === id)

    if (filterIdx !== undefined && filterIdx > -1) {
      col?.filters.splice(filterIdx, 1)
    }

    return true
  }

  watch(
    [isActivelyModifyingValues, columnFilters],
    ([isModifying, filters], [oldIsModifying]) => {
      // When we're actively modifying the filters (~ setting values or whatever), we don't do anything
      if (isModifying) {
        return
      }

      // Otherwise, we sync the filters column filters -> query builder column filters
      qbColumnFilters.value = filters

      // When we just stopped modifying, we sync the query builder column filters -> filters
      if (oldIsModifying && !isModifying) {
        syncFilters()
      }
    }
  )

  return {
    removeItem,
    syncFilters,
    qbColumnFilters,
  }
}
