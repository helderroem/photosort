import { yellow, blue, green, white } from 'chalk'
import curry from 'lodash.curry'
import ProgressBar from 'progress'
import { processFiles } from './processing'

const progress = (total) => {
  console.log(white(`processing ${blue(total)} image(s)`))
  return new ProgressBar(`${yellow('[:bar]')} ${blue(':current/:total')}`, { total })
}
const progressErrorHandler = curry((progress, error) => {
  progress.interrupt(error.message)
  progress.tick()
})

export default (readPath, writePath, globPatterns = ['**/*.{CR2,jpg,jpeg,dng,JPG,JPEG,DNG,RW2,tiff}']) => {
  console.log(white(`searching ${blue(readPath)} for image(s)`))
  return processFiles(
    progress,
    progressErrorHandler,
    readPath,
    writePath,
    globPatterns
  ).then(() => console.log(green('done 👍'))).catch(console.error)
}
