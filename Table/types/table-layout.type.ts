export type ITableLayout = {
  id: number
  name: string
  schema: string
  accessLevel?: number
  viewCode?: string
  tableName?: string

  /**
   * We reset the layout with each table param change, so we need some way to know
   * if the params were changed through the actual layout selector, in that case
   * we keep the selected layout
   */
  preventLayoutReset?: boolean
}
