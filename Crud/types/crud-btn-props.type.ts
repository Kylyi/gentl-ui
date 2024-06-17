import { type IBtnProps } from '~/components/Button/types/btn-props.type'

export type ICrudBtnProps = IBtnProps & {
  btnConfirmationnPosition?: 'left' | 'right' | 'top' | 'bottom'
  labels?: boolean
  loaderType?: 'inline' | 'block'
  loading?: boolean
  noConfirm?: boolean
  disabled?: boolean
}
