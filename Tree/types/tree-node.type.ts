// Types
import { type IItem } from '~/libs/App/types/item.type'

export type ITreeNode<T extends {} = {}> = IItem<T> & {
  id: string | number
  name: string
  parentId?: string | number | null
  parent?: ITreeNode | null
  parents?: ITreeNode[]
  children?: ITreeNode[]
  hasChildren?: boolean | null
  childrenLoaded?: boolean
}
