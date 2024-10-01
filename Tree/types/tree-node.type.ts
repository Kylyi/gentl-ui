// Types
import type { IItem } from '~/libs/Shared/types/item.type'

export type ITreeNode<T extends object = IItem> = IItem<T> & {
  /**
   * Identifier
   */
  id: string | number

  /**
   * The name of the node
   */
  name: string

  /**
   * The parent node ID
   */
  parentId?: string | number | null

  /**
   * The parent node
   */
  parent?: ITreeNode | null

  /**
   * All the parent nodes
   */
  parents?: ITreeNode[]

  /**
   * The children nodes
   */
  children?: ITreeNode[]

  /**
   * Whether the node has children
   */
  hasChildren?: boolean | null

  /**
   * Whether the children have been loaded
   */
  childrenLoaded?: boolean
}
