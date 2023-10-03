/* eslint-disable vue/one-component-per-file */
import { DefineComponent } from 'vue'
import TableCell from '~/components/Table/TableCell.vue'
import { TableColumn } from '~/components/Table/models/table-column.model'

// Store
import { useAppStore } from '~/libs/App/app.store'

export function useRenderTemporaryTableCell() {
  const { setTempComponent } = useAppStore()

  async function getCellWidth(
    row: any,
    col: TableColumn<any>,
    slotRenderFnc?: Function
  ) {
    let maxContentWidth = 0

    // NOTE - When using a slot, we need to render the component that is being
    //        used in the slot, so we can get the actual width of the cell
    if (slotRenderFnc) {
      const vnode = slotRenderFnc({
        row,
        index: 0,
        refreshDataFnc: () => {},
      })

      const RenderComponent = defineComponent({
        render() {
          return h('div', {}, [vnode])
        },
      })

      setTempComponent(RenderComponent as DefineComponent)
      await nextTick()

      const tempComponentDom = document.querySelector('#tempComponent')
      maxContentWidth = tempComponentDom?.getBoundingClientRect().width || 0
    }

    // NOTE - When not using a slot, we just use the TableCell to render the
    //        cell, and get the width of the cell
    else {
      const RenderComponent = defineComponent({
        setup() {
          return () =>
            h(TableCell, {
              row,
              col,
              style: { width: 'min-content !important', fontSize: '13px' },
            })
        },
      })

      setTempComponent(RenderComponent as DefineComponent)
      await nextTick()

      const tempComponentDom = document.querySelector('#tempComponent')
      maxContentWidth = tempComponentDom?.getBoundingClientRect().width || 0
    }

    return maxContentWidth
  }

  return { getCellWidth }
}
