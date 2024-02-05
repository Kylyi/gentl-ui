// Types
import type { IZodValidationItem } from '~/utils/zod/types/zod-validation-item.type'

export interface IFileInputProps {
  accept?: string
  disabled?: boolean
  errorTakesSpace?: boolean
  hint?: string
  loading?: boolean
  modelValue?: Array<File | IFile> | null
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
   * Validation object
   */
  validation?: IZodValidationItem | Array<IZodValidationItem | undefined>
}
