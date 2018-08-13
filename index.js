import { yellow, blue, green, white } from 'chalk'
import curry from 'lodash.curry'
import ProgressBar from 'progress'
import yargs from 'yargs'

import processFiles from './processing'

const progress = (total) => {
  console.log(white(`processing ${blue(total)} image(s)`))
  return new ProgressBar(`${yellow('[:bar]')} ${blue(':current/:total')}`, { total })
}
const progressErrorHandler = curry((progress, error) => {
  progress.interrupt(error.message)
  progress.tick()
})

export default () => {
  const { inputDir, outputDir, glob } = yargs.usage('$0 <outputDir>', 'sort files by year and month using exif data', yargs => {
    yargs.positional('outputDir', {
      describe: 'the directory to output sorted files',
      type: 'string'
    })
      .option('i', {
        alias: 'inputDir',
        describe: 'the input directory',
        default: process.cwd()
      })
      .option('g', {
        alias: 'glob',
        describe: 'glob pattern(s) to search',
        default: '**/*.{CR2,jpg,jpeg,dng,JPG,JPEG,DNG,RW2,tiff}'
      })
  }).argv
  console.log(white(`searching ${blue(inputDir)} for image(s)`))
  return processFiles(
    progress,
    progressErrorHandler,
    inputDir,
    outputDir,
    glob
  ).then(() => console.log(green('done 👍'))).catch(console.error)
}
