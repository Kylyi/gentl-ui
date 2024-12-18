import { tableIdKey } from '~/components/Table/provide/table.provide'

export function useTablePiniaStore(tableId?: string) {
  const _tableId = injectLocal(tableIdKey, tableId ?? useId())

  return defineStore(`table.${_tableId}`, () => {
    /**
     * Once data are fetched, we might need to run some functions (like `fitColumns)
     * This queue will hold those functions amd run them consecutively after the data are fetched
     */
    const onDataFetchQueue = ref<Array<(...args: any[]) => any | Promise<any>>>([])

    async function runOnDataFetchQueue() {
      for await (const fnc of onDataFetchQueue.value) {
        await fnc()
      }

      // Reset the queue
      onDataFetchQueue.value = []
    }

    return {
      onDataFetchQueue,
      runOnDataFetchQueue,
    }
  })()
}
