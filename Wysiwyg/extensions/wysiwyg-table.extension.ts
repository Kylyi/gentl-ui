import { Table, type TableOptions } from '@tiptap/extension-table'
import { TableCell, type TableCellOptions } from '@tiptap/extension-table-cell'
import { TableHeader, type TableHeaderOptions } from '@tiptap/extension-table-header'
import { TableRow, type TableRowOptions } from '@tiptap/extension-table-row'

// Custom View
import { CustomTableView } from '~/components/Wysiwyg/CustomTableView'
/**
 * Table https://tiptap.dev/docs/editor/extensions/nodes/table
 */
export function WysiwygTable(
  options?: {
    tableOptions?: Partial<TableOptions>
    cellOptions?: Partial<TableCellOptions>
    headerOptions?: Partial<TableHeaderOptions>
    rowOptions?: Partial<TableRowOptions>
  },
) {
  return [
    Table
      .configure({
        resizable: true,
        handleWidth: 4,
        cellMinWidth: 100,
        // @ts-expect-error
        View: CustomTableView,

        ...options?.tableOptions,
      })
      .extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            style: {
              default: null,
              parseHTML: element => element.getAttribute('style'),
              renderHTML: attributes => {
                return {
                  style: attributes.style ?? '',
                }
              },
            },
            class: {
              default: null,
              parseHTML: element => element.getAttribute('class'),
              renderHTML: attributes => {
                return {
                  class: attributes.class ?? 'separator-both',
                }
              },
            },
          }
        },
      }),
    TableCell.configure(options?.cellOptions),
    TableHeader.configure(options?.headerOptions),
    TableRow.configure(options?.rowOptions),
  ]
}
