export type IListFetchOptions<T = any> = {
  fetchMore?: boolean
  hasMore?: boolean
  currentRowsCount?: number
  lastRow?: T
}

export type IListFetchPayload<T = any> = {
  search?: string
  options?: IListFetchOptions<T>
  abortController?: AbortController
}

export type IListFetchFnc<T = any> = (
  payload: IListFetchPayload
) => Promise<T> | T
