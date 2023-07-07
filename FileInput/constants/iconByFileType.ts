// @unocss-include

export const ICON_BY_FILE_TYPE = {
  'application/pdf': 'bi:filetype-pdf', // PDF
  'text/csv': 'bi:filetype-csv', // CSV
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    'bi:filetype-xlsx', // XLSX
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'bi:filetype-docx', // DOCX
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    'bi:filetype-pptx', // PPTX
  'application/vnd.ms-excel': 'bi:filetype-xls', // XLS
  'application/msword': 'bi:filetype-doc', // DOC
  'application/vnd.ms-powerpoint': 'bi:filetype-ppt', // PPT
  'text/plain': 'bi:filetype-txt', // TXT
} as const
