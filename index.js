import { resolve, relative, join } from 'path'
import fg from 'fast-glob'
import curry from 'lodash.curry'
import { copy as move } from 'fs-extra'
import { yellow, blue, green, white } from 'chalk'
import addTags from './xattr'
import readExif from './exif'
import ProgressBar from 'progress'

const deriveNewFolder = (writePath, date) => (
  join(writePath, date.getFullYear().toString(), date.toLocaleString('en-GB', { month: 'long' }))
)

const deriveNewFilename = (readPath, imagePath) => relative(readPath, imagePath).replace(/\//g, '_')

const readPath = './samples/'
const writePath = 'Pictures/'
const processFile = curry((readPath, writePath, imagePath) => readExif(imagePath)
  .then(({ Model, DateTimeOriginal }) => {
    const newPath = resolve(deriveNewFolder(writePath, DateTimeOriginal), deriveNewFilename(readPath, imagePath))
    return move(imagePath, newPath)
			.then(() => addTags(newPath, Model))
  })
)

console.log(white(`searching ${blue(readPath)} for image(s)`))
const globPatterns = ['**/*.{CR2,jpg,jpeg,dng,JPG,JPEG,DNG,RW2}']
const globOptions = { cwd: readPath, absolute: true }

fg(globPatterns, globOptions)
  .then(files => {
		const total = files.length;
    console.log(white(`processing ${blue(total)} image(s)`))
    return [files, new ProgressBar(`${yellow('[:bar]')} ${blue(':current/:total')}`, { total })]
  })
  .then(([ files, progress ]) => Promise.all(files.map(file => processFile(readPath, writePath, file).then(progress.tick.bind(progress)))))
  .then(() => console.log(green('done 👍')))
  .catch(console.error)
