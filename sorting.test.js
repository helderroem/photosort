import test from 'ava'
import { dateToPath, deriveNewFolder, deriveNewFilename } from './sorting'

test('dateToPath creates the path <year>/<month> in english', t => {
  t.is(dateToPath(new Date('2011-09-23')), '2011/September')
})

// currently not supporting i18n see (intl)[https://www.npmjs.com/package/intl]
test.skip('dateToPath locale is configurable', t => {
  t.is(dateToPath(new Date('2011-09-23'), 'es-es'), '2011/Septiembre')
})

test('deriveNewFolder adds the date path to the write path', t => {
  t.is(deriveNewFolder('some/path', new Date('2011-09-23')), 'some/path/2011/September')
})

test('deriveNewFolder adds unsorted to the write path if no date supplied', t => {
  t.is(deriveNewFolder('some/path', undefined), 'some/path/unsorted')
})

test('deriveNewFilename prepends old folder path to file name, _ separated', t => {
  t.is(deriveNewFilename('old/root/', 'old/root/some/deep/folder/file.ext'), 'some_deep_folder_file.ext')
})
