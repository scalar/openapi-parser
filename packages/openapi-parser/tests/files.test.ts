import fs from 'node:fs'
import { glob } from 'glob'
import { describe, expect, test } from 'vitest'
import { parse } from '../src'

const invalidFiles = [
  'tests/files/statsocialcom.yaml',
  'tests/files/spotifycom.yaml',
]

const files = (await glob('./tests/files/*.yaml')).filter(
  (file) => !invalidFiles.includes(file),
)

// Those tests take a while, let’s run them in CI only.
if (process.env.CI) {
  describe.sequential('files:parse', async () => {
    test.each(files.slice(0, 300))('[%s] parse', async (file) => {
      const content = fs.readFileSync(file, 'utf-8')
      const result = await parse(content)

      expect(result.document.info.title).not.toBe(undefined)
    })
  })
}
// Otherwise, just check that the files are valid.
else {
  test('files.length', () => {
    expect(Array.isArray(files)).toBe(true)
  })
}
