import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { loadFiles, resolve, validate } from '../src'

const EXAMPLE_FILE = path.join(
  new URL(import.meta.url).pathname,
  '../../tests/filesystem/api/openapi.yaml',
)

describe('filesystem', async () => {
  it('validates filesystem', async () => {
    const filesystem = loadFiles(EXAMPLE_FILE)

    const result = await validate(filesystem)

    expect(result.errors).toStrictEqual([])
    expect(result.valid).toBe(true)
    expect(result.version).toBe('3.0')
  })

  it('resolves filesytem', async () => {
    const filesystem = loadFiles(EXAMPLE_FILE)

    const result = await resolve(filesystem)

    expect(result.valid).toBe(true)

    expect(result.errors).toStrictEqual([])
    expect(result.version).toBe('3.0')
    // TODO: Resolve the *path* from the given file
    // console.log('RESULT', result.schema.components.schemas.Upload)
    // @ts-ignore
    expect(result.schema.components.schemas.Upload.allOf[0].title).toBe(
      'Coordinates',
    )
  })
})
