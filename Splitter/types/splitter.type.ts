// Props type
export type ISplitterProps = {
  /**
   * Orientation of the panels.
   * @defaultValue horizontal
   */
  layout?: 'horizontal' | 'vertical' | undefined
  /**
   * Size of the divider in pixels.
   * @defaultValue 4
   */
  gutterSize?: number | undefined
  /**
   * Step factor to increment/decrement the size of the panels while pressing the arrow keys.
   * @defaultValue 1
   */
  step?: number | undefined
}

// Emit
type IResizeEmitOptions = {
  originalEvent: Event
  sizes: number[]
}

export type ISplitterEmit = {
  (e: 'resize', options: IResizeEmitOptions): void
  (e: 'resizestart', options: IResizeEmitOptions): void
  (e: 'resizeend', options: IResizeEmitOptions): void
}
