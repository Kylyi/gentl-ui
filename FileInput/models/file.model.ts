import axios from 'axios'
import type { Required } from 'utility-types'

export class FileModel {
  file: File
  isUploading?: boolean
  uploadProgress: number

  get name() {
    return this.file.name
  }

  get type() {
    return this.file.type
  }

  async upload() {
    this.isUploading = true

    const formData = new FormData()
    formData.append('files', this.file)

    // TODO: Operation for uploading the file
    await axios.post('/api/files', formData, {
      onUploadProgress: progressEvent => {
        this.uploadProgress = Math.round(
          (progressEvent.loaded / (progressEvent.total || 0)) * 100
        )
      },
    })

    this.isUploading = false
  }

  constructor(obj: Required<Partial<FileModel>, 'file'>) {
    this.file = obj.file
    this.uploadProgress = 0
  }
}
