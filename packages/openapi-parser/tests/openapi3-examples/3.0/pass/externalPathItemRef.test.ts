import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { load, readFilesPlugin, validate } from '../../../../src'

const EXAMPLE_FILE = path.join(
  new URL(import.meta.url).pathname,
  '../../pass/externalPathItemRef.yaml',
)

describe('externalPathItemRef', () => {
  it('passes', async () => {
    const { filesystem } = await load(EXAMPLE_FILE, {
      plugins: [readFilesPlugin()],
    })

    const { schema } = await validate(filesystem)

    expect(schema.paths['/test'].get).not.toBeUndefined()
    expect(schema.paths['/test'].get).toMatchObject({
      responses: {
        '200': {
          description: 'OK',
        },
      },
    })
  })
})
