// Models
import type { FileModel } from '~/components/FileInput/models/file.model'

type IOptions = {
  defaultValue?: any
  prefix?: string
}

type IArgs = {
  model: Ref<any>
  addFiles: (files: FileModel[] | IFile[], pos?: number) => void
  removeElement: (selector: string) => void
}

function prepareProvide<T extends keyof IArgs>(
  name: T,
  args?: Partial<IArgs>,
  options?: IOptions,
) {
  const { prefix = 'wysiwyg', defaultValue } = options ?? {}

  const providedValue = args?.[name] ?? injectLocal(`${prefix}${name}`, defaultValue)
  provideLocal(`${prefix}${name}`, providedValue)

  return providedValue as IArgs[T]
}

export function useWysiwygInjections(args?: Partial<IArgs>) {
  // Model
  const wysiwygModel = prepareProvide('model', args, { defaultValue: ref(null) })

  // Add files
  const wysiwygAddFiles = prepareProvide('addFiles', args, { defaultValue: () => {} })

  // Remove element
  const wysiwygRemoveElement = prepareProvide('removeElement', args, { defaultValue: () => {} })

  return {
    wysiwygModel,
    wysiwygAddFiles,
    wysiwygRemoveElement,
  }
}
