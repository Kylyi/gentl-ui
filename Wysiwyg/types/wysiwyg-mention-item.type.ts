export type IWysiwygMentionItem = {
  id: string | number
  label: string
  dataType?: DataType
  group?: string

  /**
   * Format function takes the entity object and returns the formatted value
   * @param entity the actual object that provides the data for the mention item
   * @param value the value of the `entity` object resolved based on the `id`
   */
  format?: (entity: IItem, value?: any) => any
}
