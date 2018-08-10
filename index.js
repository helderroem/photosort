import {exec} from 'child_process'
import {resolve, parse, join} from 'path'
import fg from 'fast-glob'
import {move} from 'fs-extra'
import {yellow, blue} from 'chalk'

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

const readExif = imagePath =>
  new Promise((resolve, reject) =>
    exec(`exiftool -json "${imagePath}"`, (error, stdout, stderror) => {
      if (error) {
        reject(error)
      }
      try {
        resolve(JSON.parse(stdout)[0])
      } catch (error) {
        reject(stderror)
      }
    })
  )

const deriveNewFolder = data => {
  const creationDate = new Date(
    data.DateTimeOriginal.split(' ')[0].replace(':', '-')
  )
  return `/Volumes/Masters/Pictures/${data.Model || 'Unknown'}/${creationDate.getFullYear()}/${
    months[creationDate.getMonth()]
  }`
}

const deriveNewFilename = imagePath => {
  const {dir, name, ext} = parse(resolve(imagePath))
  return `${dir
    .replace(/.+my\spictures\//, '')
    .replace('/', '_')}_${name}${ext}`
}

const createNewLocation = imagePath =>
  readExif(imagePath).then(exif =>
    join(deriveNewFolder(exif), deriveNewFilename(imagePath))
  )

const relocationFile = imagePath =>
  createNewLocation(imagePath)
    .then(newPath => {
      console.log(yellow(`moving ${blue(imagePath)} to ${blue(newPath)}\n`))
      return move(imagePath, newPath)
    })
    .catch(console.error)

// const failed = [
//   '2nd sept 2015 photos/', // Contains RW2, need to get a date from it
//   'Folkweek/', // 0 pics found
//   'LR JAN 2017/', // 0 pics found
//   'Majorca 2017/',
//   'National Trust Properties/', // 0 pics found
//   'Yvon 14 March - 11 June 2016/', // Perms
//   'Yvonne Kenwood 4:16 copy/', // 0 files
//   'fWellington Park & Peony 2016/', // Perms
//   'folk singers CJ/', // 0 pics
//   'lr cat aug 2016/', // 0 pics
//   'sandwich 2015/', // Perms
//   'tbs1 feb 16/'
// ]

// const done = [
//   ' 18.9.15 Martins Garden/',
//   '1 Asd/',
//   '100CANON/',
//   '19.9.15 Christ Church/',
//   '1st oct/',
//   '760 SD Jan 2017/',
//   '9th sept 2015 Wisley/',
//   'Animals/',
//   'Anthony Gormley/',
//   'Barnabys 5th Birthday/',
//   'Bluebells/',
//   'Campsites/',
//   'Canterbury/',
//   'Churches:Abbeys/',
//   'Clive/',
//   'Clive SPC workshop/',
//   'Clouds/',
//   'Compact Camera TBS/',
//   'DCIM/',
//   'Devon wendy 2016 /',
//   'Dover 2016/',
//   'Dungeness Aug 2016/',
//   'ECC Club Nights/',
//   'Flowers/',
//   'Folkestone/',
//   'Gardens/',
//   'Grandchildren/',
//   'Grovelands/',
//   'Kernsey Abbey/',
//   'Kernsey Crs/',
//   'Kew Gardens/',
//   'Kingston bay Folkestone Festival 2017/',
//   'London Sept 16 Pete/',
//   'London Sept 16 Yvonne/',
//   'London walk Nov 17/',
//   'Malta/',
//   'March 17/',
//   'Mersea/',
//   'Middleton Hse/',
//   'National Trust/',
//   'Pete Aug 2017/',
//   'Pete budapest dover mersea/',
//   'Peter Kenwood 19:3 /',
//   'Ramsgate/',
//   'Reculver/',
//   'Red Hse William Morris/',
//   'Regents Canal/',
//   'SPS Outings/',
//   'Saint Edumunds/',
//   'Sandwich Marina/',
//   'Snow Dec 17/',
//   'St Margarets Haystacks 2016/',
//   'Storybook/',
//   'Waves/',
//   'Weddings/',
//   'Woody/',
//   'Workshops/',
//   'Yvonne 65th/',
//   'Yvonne Kenwood 4:16/',
//   'Yvonnes Retirement Do/',
//   'budapest and dover/',
//   'hunting/',
//   'light house st marg pete 2016/',
//   'lords sue jeremy 2016/',
//   'march 17 peter/',
//   'odds/',
//   'peter TBS 2015/',
//   'reculver pete/',
//   'sandwich festival/',
//   'st Neots/',
//   'st margarets bay 2015/',
//   'storyboard/',
//   'sunsets/',
//   'to sort 101Mersea Budapest  aug 2017/',
//   'untitled folder/',
//   'yvonne folder/',
//   'my pictures/'
// ]

const mainPath = '/Volumes/Masters/my pictures/'

console.log(`searching ${mainPath} for photos`)
fg('**/*.{CR2,jpg,jpeg,dng,JPG,JPEG,DNG,RW2}', {
  cwd: mainPath,
  absolute: true
})
  .then(files => {
    console.log(`processing ${files.length}`)
    return files
  })
  .then(files => Promise.all(files.map(relocationFile)))
  .then(() => console.log('done 👍'))
  .catch(console.error)
