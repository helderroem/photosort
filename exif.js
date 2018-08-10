import { exec } from 'child_process'

const exifDateRegex = /^\d{4}:\d{2}:\d{2}\s\d{2}:\d{2}:\d{2}([+-][\d:]+)?/
export const isExifDate = date => exifDateRegex.test(date)

const exifYearMonthDayRegex = /^(\d{4}):(\d{2}):(\d{2})/
export const parseExifDate = date => new Date(date.replace(exifYearMonthDayRegex, '$1-$2-$3'))

export const parseExifData = data => {
  const json = JSON.parse(data)[0]
  return Object.keys(json).reduce((parsed, currentKey) => {
    parsed[currentKey] = isExifDate(json[currentKey]) ? parseExifDate(json[currentKey]) : json[currentKey]
    return parsed
  }, {})
}

export const readExif = execFunc => imagePath => new Promise((resolve, reject) => (
  execFunc(`exiftool -json "${imagePath}"`, (error, stdout, stderror) => {
    if (error) {
      reject(error)
    }
    try {
      resolve(parseExifData(stdout))
    } catch (error) {
      reject(stderror)
    }
  })
))

export default readExif(exec)
