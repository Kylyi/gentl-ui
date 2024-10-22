type IGroupBtn = {
  value: string | number
  label?: string
  icon?: string
  class?: ClassType
}

export type IButtonGroupProps = {
  modelValue: string | number
  buttons: IGroupBtn[]
  activeClass?: ClassType
}
