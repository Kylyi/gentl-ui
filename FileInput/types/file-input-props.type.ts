// Types
import type { FileModel } from '~/components/FileInput/models/file.model'
import type { IZodValidationItem } from '~/utils/zod/types/zod-validation-item.type'

export type IFileInputProps = {
  accept?: string
  disabled?: boolean
  downloadUrl?: string
  errorTakesSpace?: boolean
  hint?: string
  loading?: boolean
  modelValue?: Array<File | IFile | FileModel> | null
  multi?: boolean
  placeholder?: string
  readonly?: boolean
  scroller?: boolean

  /**
   * Is relevant only for `multi` and input-like mode
   */
  maxChipsRows?: number

  /**
   * Whether to hide the download button
   */
  noDownloadButton?: boolean

  /**
   * When true, the preview will not be shown, just an icon
   */
  noPreview?: boolean

  /**
   * Validation object
   */
  validation?: IZodValidationItem | Array<IZodValidationItem | undefined>
}
