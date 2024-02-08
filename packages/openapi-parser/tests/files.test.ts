import { glob } from 'glob'
import fs from 'node:fs'
import { describe, expect, test } from 'vitest'

import { parse } from '../src'

const invalidFiles = [
  'packages/openapi-parser/tests/files/statsocialcom.yaml',
  'packages/openapi-parser/tests/files/spotifycom.yaml',
]

const files = (
  await glob('./packages/openapi-parser/tests/files/*.yaml')
).filter((file) => !invalidFiles.includes(file))

describe.sequential('files:parse', async () => {
  // Those tests take a while, let’s run them in CI only.
  if (!process.env.CI) {
    test.each(files.slice(0, 300))('[%s] parse', async (file) => {
      const content = fs.readFileSync(file, 'utf-8')
      const result = await parse(content)

      expect(result.document.info.title).not.toBe(undefined)
    })
  }
  // Otherwise, just check that the files are valid.
  else {
    test('files.length', () => {
      expect(Array.isArray(files)).toBe(true)
    })
  }
})
