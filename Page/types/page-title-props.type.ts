export type IPageTitleProps = {
  /**
   * The page title
   */
  title?: string | { value: string, previousValue?: string }

  ui?: {
    titleWithShadow?: boolean
  }
}
