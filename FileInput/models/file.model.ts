import axios from 'axios'
import type { Required } from 'utility-types'

export class FileModel {
  file: File
  uploadProgress: number
  hasError = false

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

  async upload(requestHandler: any) {
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

            this.uploadProgress = Math.max(
              Math.round((loaded / (total || 1)) * 100),
              99
            )
          },
        }),
      {
        onComplete: () => (this.uploadProgress = 100),
        onError: () => (this.hasError = true),
        logging: { operationName: 'file.upload' },
      }
    )

    return data
  }

  constructor(obj: Required<Partial<FileModel>, 'file'>) {
    this.file = obj.file
    this.uploadProgress = 0
  }
}
