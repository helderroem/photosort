import test from 'ava'
import { stub, match } from 'sinon'
import { readExif, parseExifDate, isExifDate, parseExifData } from './exif'

test('isExifDate returns false if the value is not an exif formatted date', t => {
  t.false(isExifDate('2016-03-19T06:53:54.000Z'))
})

test('isExifDate returns true if the value is an exif formatted date', t => {
  t.true(isExifDate('2016:03:19 13:23:54+00:00'))
})

test('isExifDate returns true with a negative timezone', t => {
  t.true(isExifDate('2016:03:19 13:23:54-02:00'))
})

test('isExifDate returns true without a timezone', t => {
  t.true(isExifDate('2016:03:19 13:23:54'))
})

test('parseExifDate returns a date object', t => {
  const date = parseExifDate('2016:03:19 13:23:54+00:00')
  t.true(date instanceof Date)
  t.truthy(date.getDate())
})

test('parseExifDate respects timezone', t => {
  t.is(parseExifDate('2016:03:19 13:23:54+06:30').toISOString(), '2016-03-19T06:53:54.000Z')
})

test('parseExifDate works without a timezone', t => {
  t.is(parseExifDate('2016:03:19 13:23:54').toISOString(), '2016-03-19T13:23:54.000Z')
})

test('parseExifData transforms the string from exiftool to a JS object', t => {
  const data = `[{ "FileName": "example-canon-raw.CR2", "FNumber": 7.1, "ExifImageWidth": 3888, "DateTimeOriginal": "2016:03:19 13:23:51" }]`
  const result = parseExifData(data)
  t.is(result.FileName, 'example-canon-raw.CR2')
  t.is(result.FNumber, 7.1)
  t.is(result.ExifImageWidth, 3888)
  t.is(result.DateTimeOriginal.toISOString(), '2016-03-19T13:23:51.000Z')
})

test('parseExifData throws an error with malformed data', t => {
  try {
    parseExifData('malformed')
    t.fail()
  } catch (error) {
    t.pass()
  }
})

test('readExif runs exiftool against the file returning json', async (t) => {
  const exec = stub()
  exec.callsArgWith(1, null, '[{}]')
  await readExif(exec)('path/to/an/image')
  t.true(exec.calledWithExactly('exiftool -json "path/to/an/image"', match.func))
})
