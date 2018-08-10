import { resolve, relative, join } from 'path'
import fg from 'fast-glob'
import curry from 'lodash.curry'
import { copy as move } from 'fs-extra'
import { yellow, blue } from 'chalk'
import { addColor } from './xattr'

import readExif from './exif'

const deriveNewFolder = (writePath, DateTimeOriginal) => (
  join(writePath, DateTimeOriginal.getFullYear().toString(), DateTimeOriginal.toLocaleString('en-GB', { month: 'long' }))
)

const deriveNewFilename = (readPath, imagePath) => relative(readPath, imagePath).replace(/\//g, '_')

const createNewLocation = (readPath, writePath, imagePath, date) => (
  resolve(deriveNewFolder(writePath, date), deriveNewFilename(readPath, imagePath))
)

const readPath = './samples/'
const writePath = 'Pictures/'
const modelColorMap = {
  'Canon DIGITAL IXUS 70': 'Blue',
  'Canon EOS 400D DIGITAL': 'Green',
  'Canon EOS 760D': 'Purple',
  'DMC-TZ60': 'Orange',
  'Canon PowerShot S40': 'Yellow'
}

const processFile = curry((readPath, writePath, imagePath) => readExif(imagePath)
  .then(({ Model, DateTimeOriginal }) => {
    const newPath = createNewLocation(readPath, writePath, imagePath, DateTimeOriginal)
    console.log(yellow(`moving ${blue(relative(readPath, imagePath))} to ${blue(relative(writePath, newPath))} and tagging ${Model} ${modelColorMap[Model]}`))
    return move(imagePath, newPath)
      .then(addColor(newPath, modelColorMap[Model]))
  })
  .catch(console.error)
)

console.log(`searching ${readPath} for photos`)
const globPatterns = ['**/*.{CR2,jpg,jpeg,dng,JPG,JPEG,DNG,RW2}']
const globOptions = { cwd: readPath, absolute: true }

fg(globPatterns, globOptions)
  .then(files => {
    console.log(`processing ${files.length}`)
    return files
  })
  .then(files => Promise.all(files.map(processFile(readPath, writePath))))
  .then(() => console.log('done 👍'))
  .catch(console.error)
