// @unocss-include

export type IWysiwygCSSProperty =
  | 'padding'
  | 'colors'
  | 'colors-hover'
  | 'border'
  | 'border-radius'
  | 'margin'
  | 'float'
  | 'size'
  | 'text-align'

export type IWysiwygNode = {
  id: string
  label: () => string
  icon?: string
  properties?: IWysiwygCSSProperty[]

  ref: any
}

export const WYSIWYG_NODES_BY_NAME: Record<string, IWysiwygNode> = {
  // Paragraph
  paragraph: {
    id: 'paragraph',
    label: () => $t('wysiwyg.node.paragraph'),
    icon: 'i-solar:text-field-broken',
    properties: ['padding', 'colors', 'border', 'border-radius', 'text-align'],
    ref: null,
  },

  // Heading
  heading: {
    id: 'heading',
    label: () => $t('wysiwyg.node.heading'),
    icon: 'i-tabler:heading',
    properties: ['padding', 'colors', 'colors-hover', 'border', 'border-radius', 'text-align'],
    ref: null,
  },

  // Table
  // table: {
  //   id: 'table',
  //   label: () => $t('wysiwyg.node.table'),
  //   icon: 'i-bi:table',
  //   properties: ['padding', 'border', 'border-radius'],
  //   ref: null,
  // },

  // Table cell
  tableCell: {
    id: 'tableCell',
    label: () => $t('wysiwyg.node.tableCell'),
    icon: 'i-fluent:layout-cell-four-16-regular',
    properties: ['padding', 'border', 'border-radius', 'margin', 'float', 'size'],
    ref: null,
  },

  // Table row
  tableRow: {
    id: 'tableRow',
    label: () => $t('wysiwyg.node.tableRow'),
    icon: 'i-mdi:table-row',
    properties: ['colors'],
    ref: null,
  },

  // Image
  image: {
    id: 'image',
    label: () => $t('wysiwyg.node.image'),
    icon: 'i-fluent:image-16-regular',
    properties: ['float', 'margin', 'size'],
    ref: null,
  },

  // Bullet list
  bulletList: {
    id: 'bulletList',
    label: () => $t('wysiwyg.node.bulletList'),
    icon: 'i-material-symbols:format-list-bulleted-rounded',
    properties: ['padding', 'border', 'border-radius', 'margin', 'float', 'size'],
    ref: null,
  },

  // Ordered list
  orderedList: {
    id: 'orderedList',
    label: () => $t('wysiwyg.node.orderedList'),
    icon: 'i-material-symbols:format-list-numbered-rounded',
    properties: ['padding', 'border', 'border-radius', 'margin', 'float', 'size'],
    ref: null,
  },

  // Task list
  taskList: {
    id: 'taskList',
    label: () => $t('wysiwyg.node.taskList'),
    icon: 'i-tabler:checkbox',
    properties: ['padding', 'border', 'border-radius'],
    ref: null,
  },

  // List item
  listItem: {
    id: 'listItem',
    label: () => $t('wysiwyg.node.listItem'),
    icon: 'i-fluent-mdl2:field-filled',
    properties: ['padding', 'border', 'colors'],
    ref: null,
  },

  // Task item
  taskItem: {
    id: 'taskItem',
    label: () => $t('wysiwyg.node.taskItem'),
    icon: 'i-fluent:checkmark-16-regular',
    properties: ['padding', 'border', 'colors'],
    ref: null,
  },

  // Details
  details: {
    id: 'details',
    label: () => $t('wysiwyg.node.details'),
    icon: 'i-pajamas:details-block',
    properties: ['padding', 'colors'],
    ref: null,
  },

  // Details summary
  detailsSummary: {
    id: 'detailsSummary',
    label: () => $t('wysiwyg.node.detailsSummary'),
    icon: 'i-gg:details-more',
    properties: ['padding', 'colors'],
    ref: null,
  },

  // Details content
  detailsContent: {
    id: 'detailsContent',
    label: () => $t('wysiwyg.node.detailsContent'),
    icon: 'i-gg:details-more',
    properties: ['padding', 'colors'],
    ref: null,
  },

  // Link
  link: {
    id: 'link',
    label: () => $t('wysiwyg.node.link'),
    icon: 'i-ph:link',
    properties: ['padding', 'border', 'border-radius', 'colors'],
    ref: null,
  },

  // Email button
  emailButton: {
    id: 'emailButton',
    label: () => $t('wysiwyg.node.emailButton'),
    icon: 'i-formkit:button',
    properties: ['padding', 'border', 'colors', 'border-radius', 'margin', 'text-align'],
    ref: null,
  },
}
