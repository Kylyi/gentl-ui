export interface IPageDrawerProps {
  breakpoint?: keyof typeof BREAKPOINTS
  mini?: boolean
  miniWidth?: number
  modelValue?: boolean
  side?: 'left' | 'right'
  width?: number
}
