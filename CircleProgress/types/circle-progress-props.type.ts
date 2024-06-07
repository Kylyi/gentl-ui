import type { CSSProperties } from 'vue'

export type ICircleProgressProps = {
  /**
   * Progress value
   */
  progress: number

  /**
   * Circle size in pixels
   */
  size?: number

  /**
   * Stroke color
   *
   * NOTE: use `stroke-red` and similar for UnoCSS to apply the color
   */
  color?: string

  /**
   * When true, the progress text is not shown
   */
  noProgressText?: boolean

  ui?: {
    /**
     * The progress text class
     */
    textClass?: ClassType

    /**
     * The progress text style
     */
    textStyle?: CSSProperties
  }
}
