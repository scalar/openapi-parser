import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { load, readFilesPlugin, validate } from '../../../../src'

const EXAMPLE_FILE = path.join(
  new URL(import.meta.url).pathname,
  '../../pass/externalPathItemRef.yaml',
)

describe('externalPathItemRef', () => {
  it('passes', async () => {
    const filesystem = await load(EXAMPLE_FILE, {
      plugins: [readFilesPlugin()],
    })

    const result = await validate(filesystem)

    expect(result.schema.paths['/test'].get).not.toBeUndefined()
    expect(result.schema.paths['/test'].get).toMatchObject({
      responses: {
        '200': {
          description: 'OK',
        },
      },
    })
  })
})
