import {exec} from 'child_process'
import capitalize from 'lodash.capitalize'
import curry from 'lodash.curry'

export const tagsContent = tags => tags.reduce((all, tag) => `${all}<string>${tag}</string>`, '')

const plistDoctype = '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">'
export const tagPlist = tags => (
  `${plistDoctype}<plist version="1.0"><array>${tagsContent(Array.isArray(tags) ? tags : [ tags ])}</array></plist>`
)

export const addTags = curry(
  (execFunc, filePath, tags) => new Promise((resolve, reject) => execFunc(
    `xattr -w com.apple.metadata:_kMDItemUserTags '${tagPlist(tags)}' "${filePath}"`,
    (error) => {
      if (error) reject(error)
      else resolve(true)
    })
  )
)

export const validateColor = color => {
  const colors = [ 'Blue', 'Gray', 'Green', 'Purple', 'Orange', 'Red', 'Yellow' ]
  if (!colors.includes(capitalize(color))) throw new Error(`invalid color ${color}, you can choose from ${colors.join(', ')}`)
  return capitalize(color)
}

export const addColor = (filePath, color) => addTags(exec, filePath, validateColor(color))

export default addTags(exec)
