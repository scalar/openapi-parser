import { describe, expect, it } from 'vitest'

import { loadFiles, resolve, validate } from '../src'

describe('multifile', async () => {
  it('loads all files', async () => {
    const filesystem = loadFiles(
      './packages/openapi-parser/tests/multifile/api/openapi.yaml',
    )

    expect(filesystem.length).toBe(4)
    expect(filesystem[0].entrypoint).toBe(true)
    expect(filesystem[0].filename).toBe('openapi.yaml')
    expect(filesystem[0].references.length).toBe(2)

    expect(filesystem[1].entrypoint).toBe(false)
    expect(filesystem[1].filename).toBe('schemas/problem.yaml')
  })

  it('validates filesytem', async () => {
    const filesystem = loadFiles(
      './packages/openapi-parser/tests/multifile/api/openapi.yaml',
    )

    const result = await validate(filesystem)

    expect(result.errors).toBe(undefined)
    expect(result.valid).toBe(true)
    expect(result.version).toBe('3.0')
  })

  it('resolves filesytem', async () => {
    const filesystem = loadFiles(
      './packages/openapi-parser/tests/multifile/api/openapi.yaml',
    )

    const result = await resolve(filesystem)

    expect(result.errors).toBe(undefined)
    expect(result.valid).toBe(true)
    expect(result.version).toBe('3.0')
    // @ts-ignore
    expect(result.schema.components.schemas.Upload.allOf[0].title).toBe(
      'Coordinates',
    )
  })
})
