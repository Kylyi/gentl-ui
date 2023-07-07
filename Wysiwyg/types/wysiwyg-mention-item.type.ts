export type IWysiwygMentionItem = {
  id: string
  label: string
  dataType?: DataType

  /**
   * Format function takes the entity object and returns the formatted value
   * @param entity the actual object that provides the data for the mention item
   */
  format?: (entity: any) => any
}
