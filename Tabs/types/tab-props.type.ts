import type { IBtnProps } from '~/components/Button/types/btn-props.type'

export type ITabProps = {
  name: string
  label?: string
  icon?: string
  keepAlive?: boolean
  size?: IBtnProps['size']
}
