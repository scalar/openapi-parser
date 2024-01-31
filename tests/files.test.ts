import fs from 'node:fs'
import { glob } from 'glob'
import { describe, expect, test } from 'vitest'
import { parse, validate } from '../src'

const invalidFiles = [
  'tests/files/statsocialcom.yaml',
  'tests/files/spotifycom.yaml',
]

const files = (await glob('./tests/files/*.yaml')).filter(
  (file) => !invalidFiles.includes(file),
)

describe.sequential('files:parse', async () => {
  test.each(files.slice(0, 300))('[%s] parse', async (file) => {
    const content = fs.readFileSync(file, 'utf-8')
    const result = await parse(content)

    expect(result.info.title).not.toBe(undefined)
  })
})
