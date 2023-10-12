import { IBtnProps } from '~/components/Button/types/btn-props.type'

export interface ITabProps {
  name: string
  label?: string
  icon?: string
  keepAlive?: boolean
  size?: IBtnProps['size']
}
