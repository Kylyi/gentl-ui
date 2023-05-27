export interface IDrawerProps {
  absolute?: boolean
  breakpoint?: keyof typeof BREAKPOINTS
  fullHeight?: boolean
  modelValue: boolean
  noTitle?: boolean
  persistent?: boolean
  side?: 'left' | 'right'
  title?: string
  width?: number
}
