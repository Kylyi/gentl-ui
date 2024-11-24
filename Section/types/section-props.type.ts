import type { CSSProperties } from 'vue'

// Types
import type { IHeadingProps } from '~/components/Typography/types/heading-props.type'

export type ISectionProps = {
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
} & IHeadingProps
