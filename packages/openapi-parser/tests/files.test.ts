import { glob } from 'glob'
import fs from 'node:fs'
import { describe, expect, test } from 'vitest'

import { resolve } from '../src/utils/resolve'

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
describe('files:parse', async () => {
  test('files.length', () => {
    expect(Array.isArray(files)).toBe(true)

    if (files.length === 0) {
      throw new Error(
        '[ERROR] No real-world examples found, try to run `pnpm test:prepare` first.',
      )
    }

    expect(files.length).toBeGreaterThan(0)
  })

  // TODO: We’re currently only testing a few of the files for performance reasons.
  test.each(files.slice(0, 10))('[%s] parse', async (file) => {
    const content = fs.readFileSync(file, 'utf-8')
    const result = await resolve(content)

    expect(result.schema.info.title).not.toBe(undefined)
  })
})
