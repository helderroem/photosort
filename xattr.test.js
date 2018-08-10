import test from 'ava'
import { stub, match } from 'sinon'
import { tagsContent, tagPlist, addTags, validateColor } from './xattr'

test('tagsContent returns values wrapped in <string> tags', t => {
  t.snapshot(tagsContent(['some', 'xattr', 'tags']))
})

test('tagPlist returns the XML plist to tag the file', t => {
  t.snapshot(tagPlist(['some', 'xattr', 'tags']))
})

test('tagPlist works fine with a single value', t => {
  t.snapshot(tagPlist('some'))
})

test('validateColor returns the color if valid', t => {
  t.is(validateColor('Red'), 'Red')
})

test('validateColor capitalizes color', t => {
  t.is(validateColor('green'), 'Green')
})

test('validateColor throws when an invalid color is supplied', t => {
  const error = t.throws(() => validateColor('violet'), Error)
  t.true(error.message.includes('violet'))
})

test('addTags runs xattr against the file with the supplied tags', async (t) => {
  const exec = stub()
  const filePath = 'path/to/a/file'
  const plist = '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><array><string>really</string><string>amazing</string><string>tags</string></array></plist>'

  exec.callsArgWith(1, null, '')
  await addTags(exec, filePath, ['really', 'amazing', 'tags'])
  t.true(exec.calledWithExactly(`xattr -w com.apple.metadata:_kMDItemUserTags '${plist}' "${filePath}"`, match.func))
})
