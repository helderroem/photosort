import fg from 'fast-glob'
import { copy as move } from 'fs-extra'
import curry from 'lodash.curry'
import { resolve } from 'path'

import { deriveNewFolder, deriveNewFilename } from './sorting'
import addTags from './xattr'
import readExif from './exif'

export const processFile = curry((readExif, deriveNewFolder, deriveNewFilename, move, addTags, readPath, writePath, imagePath) => readExif(imagePath)
  .then(({ Model, DateTimeOriginal }) => {
    const newPath = resolve(deriveNewFolder(writePath, DateTimeOriginal), deriveNewFilename(readPath, imagePath))
    return move(imagePath, newPath).then(() => addTags(newPath, Model))
  })
)

export const processFiles = curry((glob, processFile, progress, errorHandler, readPath, writePath, globPatterns) => (
  glob(globPatterns, { cwd: readPath, absolute: true })
    .then(files => {
      const total = files.length
      return [files, progress(total)]
    })
    .then(([ files, progress ]) => Promise.all(
      files.map(file => processFile(readPath, writePath, file)
        .then(progress.tick.bind(progress))
        .catch(errorHandler(progress)))
    ))
))

export default processFiles(fg, processFile(readExif, deriveNewFolder, deriveNewFilename, move, addTags))
