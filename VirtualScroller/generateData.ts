// import { faker } from '@faker-js/faker'

const minWordCount = 5
const maxWordCount = 50
const PAGE_SIZE = 100

export function generateData(currentLength: number) {
  const items = []
  const length = PAGE_SIZE

  for (let i = 0; i < length; i++) {
    const wordCount =
      minWordCount + Math.floor(Math.random() * (maxWordCount - minWordCount))
    // For each item we take a UUID, an index and a value
    // UUID clashes here will be bad
    items.push({
      id: currentLength + i,
      index: currentLength + i,
      // value: `Item as ${faker.random.words(wordCount)}`,
      value: `Item as}`,
    })
  }

  return items
}
