// TYPES
import type { ITreeNode } from '~~/components/Tree/types/tree-node.type'

export interface ITreeNodeRowProps {
  fetchChildren?: { fnc: Function; mapKey: string }
  level: number
  maxLevel?: number
  node: ITreeNode
  preferCollapseBtnHidden?: boolean
}
