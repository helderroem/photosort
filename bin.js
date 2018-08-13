#!/usr/bin/env node
const readPath = './samples/'
const writePath = 'Pictures/'

require('reify')
require('./index').default(readPath, writePath)
