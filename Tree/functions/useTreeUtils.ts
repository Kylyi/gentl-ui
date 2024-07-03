import type { Required } from 'utility-types'

// Types
import type { ITreeNode } from '~/components/Tree/types/tree-node.type'
import type { ITreeProps } from '~/components/Tree/types/tree-props.type'

export function useTreeUtils(props: ITreeProps) {
  // Utils
  const { flattenTree } = useTraversing()

  const nodes = useVModel(props, 'nodes')
  const flattenedNodes = ref<ITreeNode[]>([])

  const nodesById = computed(() => {
    return flattenedNodes.value.reduce((agg, node) => {
      agg[node.id] = node

      return agg
    }, {} as Record<string | number, ITreeNode>)
  })

  function getNodeById(id: string | number) {
    return nodesById.value[id]
  }

  function addNode(
    node: Required<Partial<ITreeNode>, 'name'>,
    parentNode?: ITreeNode | string,
  ): void {
    if (parentNode) {
      const _parentNode
        = typeof parentNode === 'string' ? getNodeById(parentNode) : parentNode

      const nodeId = node.id || uuid()
      const newNode: ITreeNode = {
        ...node,
        id: nodeId,
        parentId: _parentNode.id,
      }

      _parentNode.children = _parentNode.children || []
      _parentNode.children = [..._parentNode.children, newNode]
    } else if (nodes.value) {
      const nodeId = node.id || uuid()

      const newNode: ITreeNode = {
        ...node,
        id: nodeId,
      }

      nodes.value = [...nodes.value, newNode]
    }
  }

  function removeNode(node: ITreeNode) {
    const parentNode = node.parentId
      ? nodesById.value[node.parentId]
      : undefined

    if (parentNode?.children) {
      parentNode.children = parentNode.children.filter(
        (child: ITreeNode) => child.id !== node.id,
      )
    } else if (nodes.value) {
      nodes.value = nodes.value.filter(
        (child: ITreeNode) => child.id !== node.id,
      )
    }
  }

  whenever(
    nodes,
    nodes => {
      flattenedNodes.value = flattenTree(nodes)
    },
    { deep: true, immediate: true },
  )

  return {
    nodes,
    getNodeById,
    addNode,
    removeNode,
  }
}
