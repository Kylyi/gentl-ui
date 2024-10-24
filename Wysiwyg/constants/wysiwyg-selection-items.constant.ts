// @unocss-include

type IWysiwygCSSProperty =
  | 'padding'
  | 'colors'
  | 'border'
  | 'border-radius'
  | 'margin'
  | 'float'
  | 'size'

type IWysiwygSelectionItem = {
  id: string
  label: () => string
  icon?: string
  properties?: IWysiwygCSSProperty[]

  ref: any
}

export const WYSIWYG_SELECTION_ITEMS_BY_ID: Record<string, IWysiwygSelectionItem> = {
  paragraph: {
    id: 'paragraph',
    label: () => $t('wysiwyg.node.paragraph'),
    icon: 'i-solar:text-field-broken',
    properties: ['padding', 'border', 'border-radius'],
    ref: null,
  },
  heading: {
    id: 'heading',
    label: () => $t('wysiwyg.node.heading'),
    icon: 'i-tabler:heading',
    properties: ['padding', 'border', 'border-radius'],
    ref: null,
  },
  table: {
    id: 'table',
    label: () => $t('wysiwyg.node.table'),
    icon: 'i-bi:table"',
    properties: ['padding', 'border', 'border-radius'],
    ref: null,
  },
  tableCell: {
    id: 'tableCell',
    label: () => $t('wysiwyg.node.tableCell'),
    icon: 'i-fluent:layout-cell-four-16-regular',
    properties: ['padding', 'border', 'border-radius', 'margin', 'float', 'size'],
    ref: null,
  },
  tableRow: {
    id: 'tableRow',
    label: () => $t('wysiwyg.node.tableRow'),
    icon: 'i-mdi:table-row',
    properties: ['padding', 'border', 'border-radius', 'margin', 'float', 'size'],
    ref: null,
  },
  image: {
    id: 'image',
    label: () => $t('wysiwyg.node.image'),
    icon: 'i-fluent:image-16-regular',
    properties: ['padding', 'colors', 'border', 'border-radius', 'margin', 'float', 'size'],
    ref: null,
  },
  bulletList: {
    id: 'bulletList',
    label: () => $t('wysiwyg.node.bulletList'),
    icon: 'i-material-symbols:format-list-bulleted-rounded',
    properties: ['padding', 'border', 'border-radius', 'margin', 'float', 'size'],
    ref: null,
  },
  orderedList: {
    id: 'orderedList',
    label: () => $t('wysiwyg.node.orderedList'),
    icon: 'i-material-symbols:format-list-numbered-rounded',
    properties: ['padding', 'border', 'border-radius', 'margin', 'float', 'size'],
    ref: null,
  },
  taskList: {
    id: 'taskList',
    label: () => $t('wysiwyg.node.taskList'),
    icon: 'i-tabler:checkbox',
    properties: ['padding', 'border', 'border-radius', 'margin', 'float', 'size'],
    ref: null,
  },
  listItem: {
    id: 'listItem',
    label: () => $t('wysiwyg.node.listItem'),
    icon: 'i-fluent-mdl2:field-filled',
    properties: ['padding', 'border', 'border-radius', 'margin', 'float', 'size'],
    ref: null,
  },
  taskItem: {
    id: 'taskItem',
    label: () => $t('wysiwyg.node.taskItem'),
    icon: 'i-fluent:checkmark-16-regular',
    properties: ['padding', 'border', 'border-radius', 'margin', 'float', 'size'],
    ref: null,
  },
  details: {
    id: 'details',
    label: () => $t('wysiwyg.node.details'),
    icon: 'i-pajamas:details-block',
    properties: ['padding', 'border', 'border-radius', 'margin', 'float', 'size'],
    ref: null,
  },
  detailsSummary: {
    id: 'detailsSummary',
    label: () => $t('wysiwyg.node.detailsSummary'),
    icon: 'i-gg:details-more',
    properties: ['padding', 'border', 'border-radius', 'margin', 'float', 'size'],
    ref: null,
  },
  detailsContent: {
    id: 'detailsContent',
    label: () => $t('wysiwyg.node.detailsContent'),
    icon: 'i-gg:details-more',
    properties: ['padding', 'border', 'border-radius', 'margin', 'float', 'size'],
    ref: null,
  },
  link: {
    id: 'link',
    label: () => $t('wysiwyg.node.link'),
    icon: 'i-ph:link',
    properties: ['padding', 'border', 'border-radius', 'margin', 'float', 'size'],
    ref: null,
  },
  emailButton: {
    id: 'emailButton',
    label: () => $t('wysiwyg.node.emailButton'),
    icon: 'i-formkit:button',
    properties: ['padding', 'border', 'border-radius', 'margin', 'float', 'size'],
    ref: null,
  },
}
