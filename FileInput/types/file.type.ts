import { models } from '~z'

export type IFile = $infer<(typeof models)['FileCreateSchema']>
