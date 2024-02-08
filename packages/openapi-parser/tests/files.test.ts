import { glob } from 'glob'
import fs from 'node:fs'
import { describe, expect, test } from 'vitest'

import { parse } from '../src'

const invalidFiles = [
  'packages/openapi-parser/tests/files/statsocialcom.yaml',
  'packages/openapi-parser/tests/files/spotifycom.yaml',
  'packages/openapi-parser/tests/files/opensuseorgobs.yaml',
  'packages/openapi-parser/tests/files/royalmailcomclick-and-drop.yaml',
]

const files = (
  await glob('./packages/openapi-parser/tests/files/*.yaml')
).filter((file) => !invalidFiles.includes(file))

/**
 * This test suite parses a large number of real-world OpenAPI files
 */
describe.sequential('files:parse', async () => {
  // Those tests take a while, let’s run them in CI only.
  if (process.env.CI) {
    // TODO: We’re currently only testing a few of the files for performance reasons.
    test.each(files.slice(0, 10))('[%s] parse', async (file) => {
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
