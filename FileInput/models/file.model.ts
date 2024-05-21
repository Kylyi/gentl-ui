import axios from 'axios'
import type { Required } from 'utility-types'

export class FileModel {
  file: File
  uploadProgress: number
  hasError = false
  uploadedFile?: {
    filepath: string
    newFilename: string
    originalFilename: string
    mimetype: string
    size: number
  }

  get name() {
    return this.file.name
  }

  get type() {
    return this.file.type
  }

  get isUploading() {
    return this.uploadProgress > 0 && this.uploadProgress < 100
  }

  get isUploaded() {
    return this.uploadProgress === 100
  }

  async upload(
    requestHandler: any,
    options?: {
      onError?: (error: any) => void
      notifyError?: boolean
    }
  ) {
    const { onError, notifyError } = options ?? {}
    if (this.uploadProgress === 100 && !this.hasError) {
      return
    }

    const filesHost = useRuntimeConfig().public.FILES_HOST ?? '/api/files'
    const formData = new FormData()
    formData.append('files', this.file)
    this.hasError = false

    const { data } = await requestHandler(
      () =>
        axios.post(filesHost, formData, {
          onUploadProgress: progressEvent => {
            const { loaded, total } = progressEvent

            this.uploadProgress = Math.min(
              Math.round((loaded / (total || 1)) * 100),
              99
            )
          },
        }),
      {
        onComplete: () => (this.uploadProgress = 100),
        onError: (error: any) => {
          this.hasError = true
          onError?.(error)
        },
        notifyError,
        logging: { operationName: 'file.upload' },
      }
    )

    this.uploadedFile = data?.[0]

    return data
  }

  async delete(
    requestHandler: any,
    options?: {
      ignoreWhenFoundInDb?: boolean
      onError?: (error: any) => void
      notifyError?: boolean
    }
  ) {
    const { onError, notifyError, ignoreWhenFoundInDb = true } = options ?? {}
    if (!this.uploadedFile) {
      return
    }

    const filesHost = useRuntimeConfig().public.FILES_HOST ?? '/api/files'

    await requestHandler(
      () => $fetch(filesHost, {
        method: 'DELETE',
        body: { path: this.uploadedFile?.filepath, ignoreWhenFoundInDb },
      }),
      {
        onError,
        notifyError,
        logging: { operationName: 'file.delete' },
      }
    )
  }

  constructor(obj: Required<Partial<FileModel>, 'file'>) {
    this.file = obj.file
    this.uploadProgress = 0
  }
}
