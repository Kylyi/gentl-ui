export type IWysiwygMentionItem = {
  id: string | number
  label: string
  dataType?: DataType
  group?: string

  /**
   * Format function takes the entity object and returns the formatted value
   * @param entity the actual object that provides the data for the mention item
   */
  format?: (entity: any) => any
}
