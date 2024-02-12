import axios from 'axios'
import type { Required } from 'utility-types'

export class FileModel {
  file: File
  uploadProgress: number

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

  async upload() {
    const formData = new FormData()
    formData.append('files', this.file)

    // TODO: Operation for uploading the file
    const { data } = await axios.post('/api/files', formData, {
      onUploadProgress: progressEvent => {
        const { loaded, total } = progressEvent

        this.uploadProgress = Math.round((loaded / (total || 1)) * 100)
      },
    })

    return data
  }

  constructor(obj: Required<Partial<FileModel>, 'file'>) {
    this.file = obj.file
    this.uploadProgress = 0
  }
}
