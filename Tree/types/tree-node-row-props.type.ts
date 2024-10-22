// TYPES
import type { ITreeNode } from '~/components/Tree/types/tree-node.type'

export type ITreeNodeRowProps = {
  fetchChildren?: { fnc: Function, mapKey: string }
  level: number
  maxLevel?: number
  node: ITreeNode
  preferCollapseBtnHidden?: boolean

  /**
   * Function to determine if a node has children - will override the node's `hasChildren` property
   */
  hasChildren?: (node: ITreeNode) => boolean
}
