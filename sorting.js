import { relative, join, sep } from 'path'

export const dateToPath = (date, locale = 'en-gb') => (
  join(date.getFullYear().toString(), date.toLocaleString(locale, { month: 'long' }))
)

export const deriveNewFolder = (writePath, date) => {
  if (date) return join(writePath, dateToPath(date))
  else return join(writePath, 'unsorted')
}

export const deriveNewFilename = (readPath, imagePath) => relative(readPath, imagePath).split(sep).join('_')
