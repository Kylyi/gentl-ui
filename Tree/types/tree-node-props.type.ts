// TYPES
import type { ITreeNode } from '~/components/Tree/types/tree-node.type'
import type { ITreeNodeRowProps } from '~~/components/Tree/types/tree-node-row-props.type'

type TreeNodeRowPropsWithoutNode = Omit<ITreeNodeRowProps, 'node'>

export interface ITreeNodeProps extends TreeNodeRowPropsWithoutNode {
  nodes?: ITreeNode[]
}
