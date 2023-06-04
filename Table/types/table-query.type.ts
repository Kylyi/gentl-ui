export type ITableQuery = {
  where: Record<string, any>
  options: {
    search: string
    orderBy: Record<string, 'asc' | 'desc'>
    take: number
    skip: number
  }
  includeDeleted: boolean
}
