// TYPES
import type { ITreeNode } from '~/components/Tree/types/tree-node.type'
import type { ITreeNodeRowProps } from '~~/components/Tree/types/tree-node-row-props.type'

export type ITreeNodeProps = Omit<ITreeNodeRowProps, 'node'> & {
  nodes: ITreeNode[]
}
