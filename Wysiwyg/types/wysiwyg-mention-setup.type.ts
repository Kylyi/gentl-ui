// Types
import type { IListProps } from '~/components/List/types/list-props.type'
import type { IListFetchFnc } from '~/components/List/types/list-fetch.type'

export type IWysiwygMentionSetup = {
  /**
   * The character that should be appended to the mention
   *
   * Note: Does not need to be a single character
   */
  appendChar?: string

  /**
   * The character that triggers the mention
   *
   * Note: Does not need to be a single character
   */
  char: string

  /**
   * The props that should be passed to the `List` component
   */
  listProps?: Partial<IListProps>

  /**
   * The type of the mention for semantic purposes
   */
  type?: string

  /**
   * The function to use for fetching the data
   *
   * Note: an actual `List` is used to display the mention data, so the response
   * should have the `payloadKey` property
   */
  loadData: IListFetchFnc

}
