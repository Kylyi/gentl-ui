import type { CSSProperties } from 'vue'

export interface ISectionProps {
  /**
   * When true, the section will have a border.
   */
  bordered?: boolean

  /**
   * When true, no padding will be applied to the section.
   */
  dense?: boolean
  headerClass?: ClassType
  sectionClass?: ClassType
  subtitle?: string
  subtitleClass?: ClassType
  title?: string | number | false | null
  titleClass?: ClassType
  titleFilled?: boolean

  /**
   * When true, the filled title will have left side border (highlight)
   * Should be used in combination with titleFilled prop.
   */
  titleFilledWithHighlight?: boolean

  /**
   * The element to use for the header
   */
  titleElement?: 'h6' | 'h5' | 'h4' | 'h3' | 'h2' | 'h1' | string

  ui?: {
    /**
     * Class to apply to the `title`
     */
    titleClass?: ClassType

    /**
     * Style to apply to the `title`
     */
    titleStyle?: CSSProperties

    /**
     * Style to apply to the `subtitle`
     */
    subtitleClass?: ClassType

    /**
     * Style to apply to the `subtitle`
     */
    subtitleStyle?: CSSProperties

    /**
     * Class to apply to the content
     */
    sectionClass?: ClassType

    /**
     * Style to apply to the content
     */
    sectionStyle?: CSSProperties
  }
}
