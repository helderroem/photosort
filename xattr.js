import {exec} from 'child_process'

const tagPlist = color => `<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <array>
    <string>${color}</string>
  </array>
</plist>`

const addColorTag = (imagePath, color) =>
  new Promise((resolve, reject) =>
    exec(
      `xattr -w com.apple.metadata:_kMDItemUserTags '${tagPlist(
        color
      )}' "${imagePath}"`,
      (error, stdout, stderror) => {
        if (error) {
          reject(error)
        }
        try {
          resolve(JSON.parse(stdout)[0])
        } catch (error) {
          reject(stderror)
        }
      }
    )
  )

export default addColorTag
