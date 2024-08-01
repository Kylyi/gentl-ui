// Types
import type { IListFetchFnc } from '~/components/List/types/list-fetch.type'

export type IWysiwygMentionSetup = {
  char: string
  type?: string
  appendChar?: string
  loadData: IListFetchFnc
}
