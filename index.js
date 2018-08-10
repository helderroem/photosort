import { resolve, relative, join } from 'path'
import fg from 'fast-glob'
import curry from 'lodash.curry'
// import { move } from 'fs-extra'
import { yellow, blue } from 'chalk'

import readExif from './exif'

const deriveNewFolder = (writePath, { DateTimeOriginal }) => (
	join(writePath, DateTimeOriginal.getFullYear().toString(), DateTimeOriginal.toLocaleString('en-GB', { month: "long" }))
)

const deriveNewFilename = (readPath, imagePath) => relative(readPath, imagePath).replace('\/', '_')

const createNewLocation = (writePath, readPath, imagePath) => readExif(imagePath)
	.then(exif => resolve(deriveNewFolder(writePath, exif), deriveNewFilename(readPath, imagePath)))

const relocateFile = curry((writePath, readPath, imagePath) =>
		createNewLocation(writePath, readPath, imagePath)
			.then(newPath => {
				console.log(yellow(`moving ${blue(relative(readPath, imagePath))} to ${blue(relative(writePath, newPath))}\n`))
				return Promise.resolve(); // move(imagePath, newPath)
			})
			.catch(console.error)
)

const readPath = './samples/'
const writePath = 'Pictures/'

console.log(`searching ${readPath} for photos`)
const globPatterns = ['**/*.{CR2,jpg,jpeg,dng,JPG,JPEG,DNG,RW2}']
const globOptions = { cwd: readPath, absolute: true };

fg(globPatterns, globOptions)
	.then(files => {
		console.log(`processing ${files.length}`)
		return files
	})
	.then(files => Promise.all(files.map(relocateFile(writePath, readPath))))
	.then(() => console.log('done 👍'))
	.catch(console.error)
