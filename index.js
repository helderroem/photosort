import { yellow, blue, green, white } from 'chalk'
import fg from 'fast-glob'
import { copy as move } from 'fs-extra'
import curry from 'lodash.curry'
import { resolve } from 'path'
import ProgressBar from 'progress'

import readExif from './exif'
import { deriveNewFolder, deriveNewFilename } from './sorting'
import addTags from './xattr'

export const processFile = curry((readPath, writePath, imagePath) => readExif(imagePath)
  .then(({ Model, DateTimeOriginal }) => {
    const newPath = resolve(deriveNewFolder(writePath, DateTimeOriginal), deriveNewFilename(readPath, imagePath))
    return move(imagePath, newPath).then(() => addTags(newPath, Model))
  })
)

const readPath = './samples/'
const writePath = 'Pictures/'
const globPatterns = ['**/*.{CR2,jpg,jpeg,dng,JPG,JPEG,DNG,RW2,tiff}']
const globOptions = { cwd: readPath, absolute: true }

export default () => {
  console.log(white(`searching ${blue(readPath)} for image(s)`))
  fg(globPatterns, globOptions)
    .then(files => {
      const total = files.length
      console.log(white(`processing ${blue(total)} image(s)`))
      return [files, new ProgressBar(`${yellow('[:bar]')} ${blue(':current/:total')}`, { total })]
    })
    .then(([ files, progress ]) => Promise.all(files.map(file => processFile(readPath, writePath, file).then(progress.tick.bind(progress)))))
    .then(() => console.log(green('done 👍')))
    .catch(console.error)
}
